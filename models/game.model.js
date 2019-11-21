const mongoose = require('mongoose');


const GameSchema = new mongoose.Schema({
    id: {type: Number},
    nom: {type: String},
    description: {type: String},
    image: {type: String},
    date_debut: {type: Date},
    date_fin: {type: Date},
    duree_game: {type: String},
    date_add: {type: Date},
    date_upd: {type: Date},
    status: {type: Boolean},
});

module.exports = mongoose.model('memory_game',GameSchema);