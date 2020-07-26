const admin = require("firebase-admin");
var serviceAccount = require("./handychat-ce4e4-firebase-adminsdk-ow1f1-ad104bb017.json");
module.exports = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://handychat-ce4e4.firebaseio.com"
});