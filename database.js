//DB setting
const Database = require("@replit/database")
const db = new Database()

exports.setKey = async function(key, value){
   await db.set(key, value);
}

exports.getKeyValue = async function(key){
   let value = await db.get(key);
    return value;
}

exports.deleteKey = async function(key){
   await db.delete(key).then(()=> {});
}

exports.listKeys = async function(){
   let keys = await db.list();
    return keys;
}

exports.listKeyPrefix = async function(prefix){
   let matches = await db.list(prefix);
   return matches;
}

/*
async function setKey(key, value) {
    await db.set(key, value);
};

async function getKeyValue(key) {
    let value = await db.get(key);
    return value;
};

async function deleteKey(key) {
    await db.delete(key);
};

async function listKeys() {
    let keys = await db.list()
    return keys;
};

async function listKeyPrefix(prefix) {
    let matches = await db.list(prefix);
    return matches;
};

setKey("hello", "wassup");
setKey("hfd", "dsfd");
getKeyValue("hello").then((value) => console.log(value));
getKeyValue("hfd").then((value) => console.log(value));
listKeys().then((keys) => console.log(keys));
*/