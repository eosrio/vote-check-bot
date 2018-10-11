const config = require("./config/config");
const Promise = require("bluebird");

// EOSJS
const eosjs = require("eosjs");
const fetch = require("node-fetch");
// const {TextDecoder, TextEncoder} = require("text-encoding");
const rpc = new eosjs.Rpc.JsonRpc(config.bp.api_url, {fetch});

// Telegram
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

// Assets
const util = require("./util");

// Mongodb
const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');
let accounts;
const client = new MongoClient(config.mongodb.db_url, {
    useNewUrlParser: true
});

client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(config.mongodb.db_name);
    accounts = db.collection("accounts");
    start();
});

function check_account(doc) {

    const account = doc.account;
    console.log(account);

    return new Promise((resolve) => {
        rpc.get_account(account).then((data) => {
            const past_weight = Number(data.voter_info.last_vote_weight);
            const current_weight = util.stake2vote(data.voter_info.staked);
            const query = {username: doc.username, account: account};

            if (past_weight === doc.last_weight) {
                if (doc.alerted === false) {
                    if (((past_weight / current_weight) <= (1 - (doc.limit / 100)))) {
                        accounts.updateOne(query, {
                            $set: {alerted: true}
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
                    resolve();
                }
            } else {
                accounts.updateOne(query, {
                    $set: {last_weight: past_weight, alerted: false}
                }, {upsert: false}).then(() => {
                    const futureDate = util.calcTime(past_weight, doc.limit, data.voter_info.staked);
                    bot.sendMessage(doc.chat_id, "Voting power updated, I will notify you when your voting power has decayed by " + doc.limit + "% \n Should be around " + futureDate);
                    resolve();
                }).catch((err) => {
                    resolve(err);
                });
            }
        }).catch((err) => {
            console.log("Error requesting data from ", config.bp.api_url, err);
            resolve(err);
        });
    });
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

function register_account(username, account, limit, chat_id) {
    console.log('Registering account: ' + account);
    return new Promise((resolve, reject) => {
        rpc.get_account(account).then((result) => {
            const past_weight = parseFloat(result['voter_info']['last_vote_weight']);
            const query = {username: username, account: account};
            const data = {
                $set: {
                    username: username,
                    account: account,
                    limit: limit,
                    chat_id: chat_id,
                    last_weight: past_weight,
                    alerted: false
                }
            };
            accounts.updateOne(query, data, {upsert: true}).then(() => {
                const futureDate = util.calcTime(past_weight, limit, result.voter_info.staked);
                resolve(futureDate);
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

function send_warning(chat_id) {
    bot.sendMessage(chat_id, "Hey there! It is time for you to confirm your votes!");
}

bot.onText(/\/register/, (msg) => {
    const params = msg.text.toString().split(" ");
    const account = params[1];
    const limit = Number(params[2]);
    if (params.length === 3 && util.validate_account(account) && util.validate_threshold(limit)) {
        register_account(msg.from.username, account, limit, msg.chat.id).then((futureDate) => {
            bot.sendMessage(msg.chat.id, "Account registered! I'll send you a message when " +
                "it is time to confirm your votes. Should be around " + futureDate);
        }).catch((e) => {
            console.log(e);
            bot.sendMessage(msg.chat.id, "Account already registered!");
        });
    } else {
        bot.sendMessage(msg.chat.id, "To register an account type: /register ACCOUNT_NAME LIMIT");
    }
});

bot.onText(/\/remove/, (msg) => {
    const params = msg.text.toString().split(" ");
    if (params.length === 2 && util.validate_account(params[1])) {
        const account = params[1];
        remove_account(msg.from.username, account).then((result) => {
            if (result.result.n === 1) {
                bot.sendMessage(msg.chat.id, "Account removed!");
            } else {
                bot.sendMessage(msg.chat.id, "Account not found!");
            }
        });
    } else {
        bot.sendMessage(msg.chat.id, "To remove an account type: /remove ACCOUNT_NAME");
    }
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! I can help you keep track of your votes on EOS platform! " +
        "As the time passes, your voting power decays and it is importante to confirm " +
        "them once in a while. All you need to do is register your EOS account and I'll " +
        "let you know when the time comes.");
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "To register an account type: /register ACCOUNT_NAME LIMIT " +
        "where 0 < LIMIT < 100. LIMIT represents the % of voting power you accept to loose.");
    bot.sendMessage(msg.chat.id, "To remove an account type: /remove ACCOUNT_NAME");
});

function main() {
    check_status();
}

function start() {
    main();
    setInterval(() => {
        main();
    }, config.sleep_time)
}


