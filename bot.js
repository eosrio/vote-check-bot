// EOSJS
const eosjs = require("eosjs");
const fetch = require("node-fetch");
const {TextDecoder, TextEncoder} = require("text-encoding");

// Telegram
const TelegramBot = require("node-telegram-bot-api");

// Assets
const util = require("./util");
const config = require("./config/config");

const bot = new TelegramBot(config.telegram_bot.bot_token, {polling: true});

// Mongodb


module.exports = {
    check_status: function () {

    },
};
