const mongoose = require('mongoose');

const LevelSchema = mongoose.Schema({
    id:{type:Number},
    game_id:{type:Number},
    niveau:{type:Number},
    nombre_case:{type:Number},
    case_visible:{type:String},
    temps_transition:{type:Number},
    temps_affichage:{type:Number},
    ordre:{type:Boolean},
    date_add:{type:Date},
    date_upd:{type:Date},
    status:{type:Boolean}
});

module.exports= mongoose.model('memory_levelgame',LevelSchema);