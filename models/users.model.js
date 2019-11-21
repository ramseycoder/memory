const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id : {type: Number},
    nom : {type:String},
    password : {type:String},
    date_add : {type:Date},
    date_upd : {type:Date},
    status : {type:Boolean},
});

module.exports = mongoose.model('memory_usergame',UserSchema);