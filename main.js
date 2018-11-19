const config = require("./config/config");
const Promise = require("bluebird");

// EOSJS
const eosjs = require("eosjs");
const fetch = require("node-fetch");
const rpc = new eosjs.Rpc.JsonRpc(config.bp.api_url, {fetch});

// Telegram
process.env["NTBA_FIX_319"] = 1; // Fix for "Promise cancellation has been deprecated" message.
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

// Assets
const assert = require('assert');
const util = require("./util");
const strings = require("./bot_strings");

// Mongodb
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(config.mongodb.db_url, {useNewUrlParser: true});
let accounts;

client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(config.mongodb.db_name);
    accounts = db.collection("accounts");

    start();
});

let handle;
function start() {
    handle = setInterval(() => {
        main();
    }, config.sleep_time);
}

process.on("SIGINT", () => {
    clearInterval(handle);
    client.close(true);

    console.log("Exiting...");
    process.exit();
});

function main() {
    check_status();
}

function check_status() {
    accounts.find({}).toArray((err, result) => {
        if (!err) {
            if (result) {
                Promise.map(result, check_account, {concurrency: 1});
            }
        }
    });
}

function check_account(doc) {
    const account = doc.account;
    console.log("Checking account: ", account);

    return new Promise((resolve) => {
        rpc.get_account(account).then((data) => {
            const past_weight = Number(data.voter_info.last_vote_weight);
            const current_weight = util.stake2vote(data.voter_info.staked);
            const query = {username: doc.username, account: account};
            const current_date = new Date();

            if (past_weight === doc.last_weight) {
                if (doc.alerted === false) {
                    if (((past_weight / current_weight) <= (1 - (doc.threshold / 100)))) {
                        accounts.updateOne(query, {
                            $set: {alerted: true, last_alert: current_date.getTime() / 1000}
                        }, {upsert: false}).then(() => {
                            send_warning(doc.chat_id);
                            resolve();
                        }).catch((err) => {
                            resolve(err);
                        });
                    } else {
                        resolve();
                    }
                } else {
                    if (doc.alert_freq !== 0 && (current_date.getTime() / 1000) > (doc.last_alert + doc.alert_freq)) {
                        accounts.updateOne(query, {
                            $set: {last_alert: current_date.getTime() / 1000}
                        }, {upsert: false}).then(() => {
                            send_warning(doc.chat_id);
                            resolve();
                        }).catch((err) => {
                            resolve(err);
                        });
                    } else {
                        resolve();
                    }
                }
            } else {
                accounts.updateOne(query, {
                    $set: {last_weight: past_weight, alerted: false}
                }, {upsert: false}).then(() => {
                    const futureDate = util.calcTime(past_weight, doc.threshold, data.voter_info.staked);
                    const message = strings.VOTE_UPDATED + doc.threshold + "%\n\n" + strings.WARNING_TIME + futureDate;
                    bot.sendMessage(doc.chat_id, message);
                    resolve();
                }).catch((err) => {
                    resolve(err);
                });
            }
        }).catch((err) => {
            console.log("Error requesting data from ", config.bp.api_url, "\n", err);
            resolve(err);
        });
    });
}

function register_account(username, account, threshold, chat_id) {
    return new Promise((resolve, reject) => {
        rpc.get_account(account).then((result) => {
            const past_weight = parseFloat(result['voter_info']['last_vote_weight']);
            const query = {username: username, account: account};
            const data = {
                $set: {
                    username: username,
                    account: account,
                    threshold: threshold,
                    chat_id: chat_id,
                    last_weight: past_weight,
                    alerted: false,
                    alert_freq: 0,
                    last_alert: 0
                }
            };
            accounts.updateOne(query, data, {upsert: true}).then((res) => {
                const futureDate = util.calcTime(past_weight, threshold, result.voter_info.staked);
                resolve({upserted: res.upsertedCount, modified: res.modifiedCount, date: futureDate});
            }).catch((err) => {
                reject(err);
            });
        }).catch((err2) => {
            reject(err2);
        });
    });
}

function remove_account(username, account) {
    const query = {username: username, account: account};
    return accounts.deleteOne(query, {justOne: true});
}

function update_frequency(username, account, frequency) {
    return new Promise((resolve, reject) => {
        rpc.get_account(account).then(() => {
            const query = {username: username, account: account};
            const data = {
                $set: {alert_freq: frequency}
            };
            accounts.updateOne(query, data).then((res) => {
                resolve(res.modifiedCount);
            }).catch((err) => {
                reject(err);
            });
        }).catch((err2) => {
            reject(err2);
        });
    });
}

function send_warning(chat_id) {
    bot.sendMessage(chat_id, strings.WARNING_MESSAGE);
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, strings.WELCOME + "\n\n" + strings.START + "\n\n" + strings.MORE_INFORMATION);
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, strings.HELP, {parse_mode : "Markdown"});
});

bot.on("message", (msg) => {
    if(msg.text.toString().search(/(\/start|\/help)/) === -1) {
        const account = msg.text.toString();
        if (util.validate_account(account)) {
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Register Account",
                                callback_data: JSON.stringify({
                                    cmd: "register",
                                    act: account
                                })
                            },
                            {
                                text: "Update Decay Threshold",
                                callback_data: JSON.stringify({
                                    cmd: "update",
                                    act: account
                                })
                            },
                        ],
                        [
                            {
                                text: "Set Alert Frequency",
                                callback_data: JSON.stringify({
                                    cmd: "alert",
                                    act: account
                                })
                            },
                            {
                                text: "Remove Account",
                                callback_data: JSON.stringify({
                                    cmd: "remove",
                                    act: account
                                })
                            }
                        ]
                    ]
                }
            };
            bot.sendMessage(msg.chat.id, strings.SELECT_ACTIONS, opts);
        } else {
            bot.sendMessage(msg.chat.id, strings.INVALID_ACCOUNT + "\n\n" + strings.MORE_INFORMATION);
        }
    }
});

bot.on("callback_query", function onCallbackQuery(callbackQuery) {
    const data = JSON.parse(callbackQuery.data);

    const chat_id = callbackQuery.message.chat.id;
    const message_id = callbackQuery.message.message_id;
    const username = callbackQuery.from.username;

    if (data.cmd === "register" || data.cmd === "update") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "1%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 1
                            })
                        },
                        {
                            text: "2.5%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 2.5
                            })
                        },
                        {
                            text: "5%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 5
                            })
                        },
                        {
                            text: "10%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 10
                            })
                        },
                        {
                            text: "15%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 15
                            })
                        },
                        {
                            text: ">= 20%",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 20
                            })
                        }
                    ]
                ]
            }
        };

        bot.editMessageText(strings.SELECT_THRESHOLD, opts);
        bot.answerCallbackQuery(callbackQuery.id);
    } else if (data.cmd === "alert") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Once",
                            callback_data: JSON.stringify({
                                cmd: "frequency",
                                act: data.act,
                                val: 0
                            })
                        },
                        {
                            text: "Once Per Day",
                            callback_data: JSON.stringify({
                                cmd: "frequency",
                                act: data.act,
                                val: 1
                            })
                        },
                        {
                            text: "Once Per Week",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 7
                            })
                        },
                        {
                            text: "Once Per Month",
                            callback_data: JSON.stringify({
                                cmd: "threshold",
                                act: data.act,
                                val: 30
                            })
                        }
                    ]
                ]
            }
        };

        bot.editMessageText(strings.SELECT_FREQUENCY, opts);
        bot.answerCallbackQuery(callbackQuery.id);
    } else if (data.cmd === "remove") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Yes",
                            callback_data: JSON.stringify({
                                cmd: "confirmation",
                                act: data.act,
                                val: true
                            })
                        },
                        {
                            text: "No",
                            callback_data: JSON.stringify({
                                cmd: "confirmation",
                                act: data.act,
                                val: false
                            })
                        }
                    ]
                ]
            }
        };

        bot.editMessageText(strings.REMOVE_CONFIRMATION, opts);
        bot.answerCallbackQuery(callbackQuery.id);
    } else if (data.cmd === "threshold") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id
        };

        register_account(username, data.act, data.val, chat_id).then((result) => {
            if(result.upserted) {
                console.log("New account registered: ", data.act);
                bot.editMessageText(strings.SEND_ALERT + "\n\n" + strings.WARNING_TIME + result.date, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ACCOUNT_REGISTERED_ALERT});
            } else if(result.modified) {
                console.log("Account updated: ", data.act);
                bot.editMessageText(strings.SEND_ALERT + "\n\n" + strings.WARNING_TIME + result.date, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ACCOUNT_UPDATED_ALERT});
            } else {
                bot.editMessageText(strings.ALREADY_REGISTERED, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ALREADY_REGISTERED_ALERT});
            }
        }).catch((e) => {
            bot.editMessageText(strings.ERROR, opts);
            bot.answerCallbackQuery(callbackQuery.id, {text: strings.ERROR_ALERT});
            console.log(e);
        });
    } else if (data.cmd === "frequency") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id
        };

        update_frequency(username, data.act, util.calcFreq(data.val)).then((result) => {
            if (result) {
                console.log("Alert frequency updated for account: ", data.act);
                let message;
                if (data.val === 0) {
                    message = strings.ALERT_FREQUENCY_UPDATED + "only once."
                } else if (data.val === 1) {
                    message = strings.ALERT_FREQUENCY_UPDATED + "every day."
                } else if (data.val === 7) {
                    message = strings.ALERT_FREQUENCY_UPDATED + "every week."
                } else if (data.val ===30) {
                    message = strings.ALERT_FREQUENCY_UPDATED + "every month."
                }
                bot.editMessageText(message, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ALERT_FREQUENCY_UPDATED_ALERT});
            } else {
                bot.editMessageText(strings.ACCOUNT_NOT_FOUND, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ACCOUNT_NOT_FOUND_ALERT});
            }
        }).catch((e) => {
            bot.editMessageText(strings.ERROR, opts);
            bot.answerCallbackQuery(callbackQuery.id, {text: strings.ERROR_ALERT});
            console.log(e);
        });

    } else if (data.cmd === "confirmation") {
        const opts = {
            chat_id: chat_id,
            message_id: message_id
        };

        if (data.val) {
            remove_account(username, data.act).then((result) => {
                if (result.result.n === 1) {
                    console.log("Account removed: ", data.act);
                    bot.editMessageText(strings.ACCOUNT_REMOVED, opts);
                    bot.answerCallbackQuery(callbackQuery.id, {text: strings.ACCOUNT_REMOVED_ALERT});
                } else {
                    bot.editMessageText(strings.ACCOUNT_NOT_FOUND, opts);
                    bot.answerCallbackQuery(callbackQuery.id, {text: strings.ACCOUNT_NOT_FOUND_ALERT});
                }
            }).catch((e) => {
                bot.editMessageText(strings.ERROR, opts);
                bot.answerCallbackQuery(callbackQuery.id, {text: strings.ERROR_ALERT});
                console.log(e);
            });
        } else {
            bot.editMessageText(strings.ACCOUNT_NOT_REMOVED, opts);
        }
    }
});
