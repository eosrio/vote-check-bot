//const eosjs = require('eosjs');
//const fetch = require('node-fetch');
//const {TextDecoder, TextEncoder} = require('text-encoding');

const bot = require('./bot');

//TODO: Move config data to other file
const block_timestamp_epoch = 946684800;
const seconds_per_week = 24 * 3600 * 7;

function stake2vote(staked) {
    const now = new Date().getTime() / 1000;
    const weight = (now - block_timestamp_epoch) / seconds_per_week / 52.0000;
    return staked * Math.pow(2, weight);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while(true) {
        await sleep(10000);
        console.log("delay");

        //TODO: check status of all accounts and send warning
    }
}

main();



//const rpc = new eosjs.Rpc.JsonRpc('https://api.eosrio.io', {fetch});
//rpc.get_account("ge3tinjwgage").then((data) => {
//    console.log(data.voter_info.last_vote_weight);
//    console.log(stake2vote(data.voter_info.staked));
//});

// rpc.get_table_rows({
//     json: true,
//     code: "eosio",
//     scope: "eosio",
//     table: "global"
// }).then((data) => {
//     console.log(data);
// });

