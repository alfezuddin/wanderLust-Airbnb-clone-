const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
// ye hamara user name salting hashing sab add kar deta hai apne aap ye ismeBAHUT METHOD BHI HOTI HAI YE APNE JAISE AUTHENTICATION


const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique: true
    }
})


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);