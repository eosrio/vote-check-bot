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
                        if(past_weight * (1 + (doc.limit / 100)) < current_weight) {
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

bot.onText(/\/register/, (msg) => {
    const params = msg.text.toString().split(" ");
    const account = params[1];
    const limit = Number(params[2]);
    if(params.length == 3 && util.validate_account(account) && util.validate_limit(limit)){
        util.register_account(msg.from.username, account, limit, msg.chat.id, (result, err) => {
            if(err === undefined) {
                if(result) {
                    bot.sendMessage(msg.chat.id, "Account registered! I'll send you a message when " +
                                    "it is time to confirm your votes");
                } else {
                    bot.sendMessage(msg.chat.id, "Account already registered!");
                }
            }
        });
    } else {
        bot.sendMessage(msg.chat.id, "To register an account type: /register ACCOUNT_NAME LIMIT");
    }
});

bot.onText(/\/remove/, (msg) => {
    const params = msg.text.toString().split(" ");
    if(params.length == 2 && util.validate_account(params[1])) {
        const account = params[1];

        util.remove_account(msg.from.username, account, (result, err) => {
            if(err === undefined) {
                if(result) {
                    bot.sendMessage(msg.chat.id, "Account removed!");
                } else {
                    bot.sendMessage(msg.chat.id, "Account not found!");
                }
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

function send_warning (chat_id) {
    bot.sendMessage(chat_id, "Hey there! It is time for you to confirm your votes!");
}
