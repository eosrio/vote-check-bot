const bot = require("./bot");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while(true) {
        await sleep(30000);
        bot.check_status();
    }
}

main();
