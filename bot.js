const eosjs = require("eosjs");
const fetch = require("node-fetch");
const {TextDecoder, TextEncoder} = require("text-encoding");

const TelegramBot = require("node-telegram-bot-api");

const util = require("./util");
const config = require("./config/config");

const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

module.exports = {
    check_status: function () {
        util.find_accounts((result, err) => {
            if(err === undefined) {
                for(let i = 0; i < result.length; ++i) {
                    const doc = result[i];

                    const rpc = new eosjs.Rpc.JsonRpc(config.bp.api_url, {fetch});
                    rpc.get_account(doc.account).then((data) => {
                        const past_weight = Number(data.voter_info.last_vote_weight);
                        const current_weight = util.stake2vote(data.voter_info.staked);

                        // Check if vote has decayed below limit
                        if(past_weight * (1 + Number(doc.limit) / 100) < current_weight) {
                            send_warning(doc.chat_id);
                        }
                    }).catch((err) => {
                        console.log("Error requesting data from ", config.bp.api_url);
                    });
                }
            }
        });
    },
};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome!");
});

bot.onText(/\/register/, (msg) => {
    const params = msg.text.toString().split(" ");
    if(params.length == 3) {
       const account = params[1];
       const limit = params[2];
       //TODO: Validate account and limit

        util.register_account(msg.from.username, account, limit, msg.chat.id, (result, err) => {
            if(err === undefined) {
                if(result) {
                    bot.sendMessage(msg.chat.id, "Account registered!");
                } else {
                    bot.sendMessage(msg.chat.id, "Account already registered!");
                }
            }
        });
    } else {
        //TODO: Show how bot works
    }
});

bot.onText(/\/remove/, (msg) => {
    const account = msg.text.toString().substring(8);
    util.remove_account(msg.from.username, account, (result, err) => {
        if(err === undefined) {
            if(result) {
                bot.sendMessage(msg.chat.id, "Account removed!");
            } else {
                bot.sendMessage(msg.chat.id, "Account not found!");
            }
        }
    });
});

bot.on("message", (msg) => {
    //TODO: Show how bot works
    //console.log("message: ", msg);
});

function send_warning (chat_id) {
    bot.sendMessage(chat_id, "Hey there! It is time for you to confirm your votes!");
}
