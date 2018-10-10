const bot = require("./bot");
const config = require("./config/config");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while(true) {
        await sleep(config.sleep_time);
        bot.check_status();
    }
}

main();
