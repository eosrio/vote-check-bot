const TelegramBot = require('node-telegram-bot-api');

const util = require('./util');
const config = require('./config/config');

const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome!");
});

bot.onText(/\/register/, (msg) => {
    util.register_account(msg.from.username, msg.text.toString().substring(10), msg.chat.id, (result) => {
        if(result) {
            bot.sendMessage(msg.chat.id, "Account registered!");
        } else {
            bot.sendMessage(msg.chat.id, "Account already registered!");
        }
    });
});

bot.onText(/\/remove/, (msg) => {
    util.remove_account(msg.from.username, msg.text.toString().substring(8), (result) => {
        if(result) {
            bot.sendMessage(msg.chat.id, "Account removed!");
        } else {
            bot.sendMessage(msg.chat.id, "Account not found!");
        }
    });
});

bot.on('message', (msg) => {
    //TODO: Show how bot works
    //console.log("message: ", msg);
});


