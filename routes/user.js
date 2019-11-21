const express = require('express');
const router = new express.Router();
const {gameQueries} = require('../controllers/game.controller');
let compt = 0;
router.route('/user-register')
    .get((req,res)=>{
       res.render('user_register');
    });

router.route('/')
    .get((req,res)=>{
        res.render('user_login');
    });


router.route('/set-game')
    .get((req,res)=>{
        res.render('set-game')
    });

router.route('/nan_games/games')
    .get( async (req,res)=>{
        if(req.session.game){
            compt = 0;
            const user = req.session.game;
            const resu = await gameQueries.getAllGame();
            const alllevels = await gameQueries.getAllLevel();
            res.render('game_index',{user:user,games:resu.games,levelsmemorylength:alllevels.levels.length});
        }else{
            res.redirect('/');
        }
    });
router.route('/deconnexion')
    .get(async (req,res)=>{
        delete req.session.game;
        req.session.save();
        res.redirect('/nan_games/games')
    });

router.route('/nan_games/games/:id')
    .get(async (req,res)=>{
        if(req.session.game) {
            compt++;
            const resu = await gameQueries.getGame(req.params.id);
            req.session.game.game_id = resu.game.id;
            req.session.save();
            // console.log("verif : "+verifDate(req.session.game.games,resu.game._id) && compt >= 2);
            let timegame = await gameQueries.getTimeGame({
                user_id: req.session.game.id,
                game_id: req.session.game.game_id
            });
            console.log(timegame.time -  Math.round(new Date().getTime() / 1000));
            if (timegame.time - Math.round(new Date().getTime() / 1000) == 0){
                res.redirect('/nan_games/games');
            }else if(timegame.time > 0){
                res.render('game', {user:req.session.game,game: resu.game,instance:true,gardeSession:true});
            }else{
                res.render('game', {user:req.session.game,game: resu.game,instance:false,gardeSession:false});
            }

            /* if(compt >= 2){
                res.render('game', {user:req.session.game,game: resu.game,instance:true});
            }else{
                res.render('game', {user:req.session.game,game: resu.game,instance:false});
            }else{
                res.redirect('/');
            } */
        }
        else
            res.redirect('/');
    });

router.route('/game2')
    .get((req,res)=>{
       res.render('game2');
    });

const verifIdGame = (tab,game) => {
    let verif = false;
    tab.forEach(el => {
       el.id_game.toString() === game.toString() ? verif = true : '';
    });
    return false;
};

const verifDate = (games, id) => {
    let verif = false;
    games.forEach(game => {
       if(game.id_game === id.toString()){
           if(game.dateFin !== 0){
               verif = true;
           }
       }
    });
    return verif;
};

module.exports = router;