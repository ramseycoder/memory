const Game = require('../models/game.model');
const Level = require('../models/levelmemory.model');
const mongoose = require('mongoose');

exports.gameQueries = class{

    static getGame(data){
       return new Promise(async next => {
           await mongoose.connection.db.collection('memory_games',(err,collection)=>{
               collection.findOne({id:parseInt(data)}).then(game=>{
                   next({etat:true,game:game});
               }).catch(err=>{
                   next({etat:false, err:err});
               })
           });
        });
    }

    static getAllGame(){
        return new Promise(async next => {
           await mongoose.connection.db.collection('memory_games',(err,collection)=>{
                collection.find().toArray((err,games)=>{
                    next({etat:true,games:games});
                })
            });
        });
    }


    static getAllLevel(){
        return new Promise(async next => {
            await mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                collection.find().toArray((err,levels)=>{
                    next({etat:true,levels:levels});
                })
            });
        })
    }



    static getLevel(data){
        return new Promise(async next =>{
            await mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                collection.find().toArray( async (err,result)=> {
                    await mongoose.connection.db.collection('memory_games',(err,collection)=>{
                       collection.findOne({id:data.game}).then(game => {
                           next({etat:true,duree:game.duree_game,level:result[data.level]});
                       })
                    });

                });
            });
        });
    }


    static getTimeGame(data){
        return new Promise(async next => {
            console.log(data);
            await mongoose.connection.db.collection('memory_timegame',(err,collection)=>{
                collection.findOne({user_id:data.user_id,game_id:data.game_id}).then(res => {
                    next({etat:true,time:res.date_fin_game});
                }).catch( err => {
                    next({etat:true, err:err})
                })
            })
        })
    }

};