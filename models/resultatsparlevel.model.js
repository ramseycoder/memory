const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    id:{type: Number},
    user_id:{type:Number},
    game_id:{type:Number},
    level:{type:Number},
    nbre_tentative:{type:Number},
    date_add:{type:Date},
    date_upd:{type:Date},
    status:{type:Boolean},
});

module.exports = mongoose.model('memory_resultatparlevel',levelSchema);