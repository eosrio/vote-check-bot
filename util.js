const MongoClient = require("mongodb").MongoClient;

const config = require("./config/config");

const block_timestamp_epoch = 946684800;
const seconds_per_week = 24 * 3600 * 7;

module.exports = {
    stake2vote: function (staked) {
        const now = new Date().getTime() / 1000;
        const weight = (now - block_timestamp_epoch) / seconds_per_week / 52.0000;
        return staked * Math.pow(2, weight);
    },

    //TODO: Check if is a valid account
    validate_account: function (account) {
        
    },
    
    register_account: function (username, account, limit, chat_id, callback) {
        MongoClient.connect(config.mongodb.db_url, {useNewUrlParser: true}).then((db) => {
            const database = db.db("vote_check");
    
            const query = {username: username, account: account};
            database.collection("accounts").find(query).toArray().then((result) => {
                if(result.length == 0) {
                    const data = {username: username, account: account, limit: limit, chat_id: chat_id};
                    database.collection("accounts").insertOne(data).then((res) => {
                        db.close();
                        console.log("Account registered!");
                        if (callback && typeof(callback) === "function") {
                            callback(true);
                        }
                    }).catch((err) => {
                        console.log("Failed to insert document to DataBase!");
                        if (callback && typeof(callback) === "function") {
                            callback(false, err);
                        }
                    });
                } else {
                    console.log("Account already registered!");
                    if (callback && typeof(callback) === "function") {
                        callback(false);
                    }
                }
            
            }).catch((err) => {
                console.log("Failed to execute query!");
                if (callback && typeof(callback) === "function") {
                    callback(false, err);
                }
            });
        }).catch((err) => {
            console.log("Failed to connect to DataBase!");
            if (callback && typeof(callback) === "function") {
                callback(false, err);
            }
        });
    },
    
    remove_account: function (username, account, callback) {
        MongoClient.connect(config.mongodb.db_url, {useNewUrlParser: true}).then((db) => {
            const database = db.db("vote_check");
    
            const query = {username: username, account: account};
            database.collection("accounts").find(query).toArray().then((result) => {
                if(result.length != 0) {
                    database.collection("accounts").deleteOne(query).then((res) => {
                        db.close();
                        console.log("Account removed!");
                        if (callback && typeof(callback) === "function") {
                            callback(true);
                        }
                    }).catch((err) => {
                        console.log("Failed to remove document from DataBase!");
                        if (callback && typeof(callback) === "function") {
                            callback(false, err);
                        }
                    });
                } else {
                    console.log("Account not found!");
                    if (callback && typeof(callback) === "function") {
                        callback(false);
                    }
                }
            }).catch((err) => {
                console.log("Failed to execute query!");
                if (callback && typeof(callback) === "function") {
                    callback(false, err);
                }
            });
        }).catch((err) => {
            console.log("Failed to connect to DataBase!");
            if (callback && typeof(callback) === "function") {
                callback(false, err);
            }
        });
    },
    
    find_accounts: function (callback) {
        MongoClient.connect(config.mongodb.db_url, {useNewUrlParser: true}).then((db) => {
            const database = db.db("vote_check");
    
            const query = {};
            database.collection("accounts").find(query).toArray().then((result) => {
                if(result.length != 0) {
                    if (callback && typeof(callback) === "function") {
                        callback(result);
                    }
                }
            }).catch((err) => {
                console.log("Failed to execute query!");
                if (callback && typeof(callback) === "function") {
                    callback(result, err);
                }
            });
        }).catch((err) => {
            console.log("Failed to connect to DataBase!");
            if (callback && typeof(callback) === "function") {
                callback(result, err);
            }
        });
    }
};
