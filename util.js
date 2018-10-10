const MongoClient = require("mongodb").MongoClient;

const config = require("./config/config");

module.exports = {
    //TODO: Check if is a valid account
    validate_account: function (account) {
        
    },
    
    register_account: function (username, account, chat_id, callback) {
        MongoClient.connect(config.mongodb.db_url, {useNewUrlParser: true}).then((db) => {
            const database = db.db("vote_check");
    
            const query = {username: username, account: account};
            database.collection("accounts").find(query).toArray().then((result) => {
                if(result.length == 0) {
                    const data = {username: username, account: account, chat_id: chat_id};
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
    
    check_status: function (callback) {
        MongoClient.connect(config.mongodb.db_url, {useNewUrlParser: true}).then((db) => {
            const database = db.db("vote_check");
    
            const query = {};
            database.collection("accounts").find(query).toArray().then((result) => {
                if(result.length != 0) {
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
    }
};
