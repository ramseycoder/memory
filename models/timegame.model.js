const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    id:{type: Number},
    user_id:{type:Number},
    game_id:{type:Number},
    date_debut:{type:Date},
    date_fin_game:{type:Number},
    status:{type:Boolean},
});

module.exports = mongoose.model('memory_timegame',levelSchema);