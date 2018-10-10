const TelegramBot = require("node-telegram-bot-api");

const util = require("./util");
const config = require("./config/config");

const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome!");
});

bot.onText(/\/register/, (msg) => {
    const account = msg.text.toString().substring(10);
    util.register_account(msg.from.username, account, msg.chat.id, (result, err) => {
        if(err === undefined) {
            if(result) {
                bot.sendMessage(msg.chat.id, "Account registered!");
            } else {
                bot.sendMessage(msg.chat.id, "Account already registered!");
            }
        }
    });
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

function send_warning(chat_id) {
    bot.sendMessage(chat_id, "Hey there! It is time for you to confirm your votes!");
}
