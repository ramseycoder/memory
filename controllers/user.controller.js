const User = require('../models/users.model');
const Game = require('../models/game.model');
const mongoose = require('mongoose');

exports.userQueries = class {

    static getUser(data) {
        return new Promise(async next => {
            await mongoose.connection.db.collection('memory_usergame', (err, collect) => {
                collect.findOne({
                    nom: data.nom,
                    password: data.password
                }).then(user => {
                    next({etat: true, user: user});
                }).catch(err => {
                    next({etat: false, err: err});
                });
            })
        });
    }

    static setNumberTentatives(data) {
        return new Promise(async next => {
            data.date_add = new Date();
            data.date_upd = new Date();
            data.status = true;
            await mongoose.connection.db.collection('memory_resultatparlevel',(err,collection)=>{
                collection.findOne({user_id:data.user_id,game_id:data.game_id,level:data.level}).then(succ => {
                    if(succ == null){
                        collection.insertOne(data)
                            .then(success => {
                                mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                                    collection.find().toArray((err,res)=>{
                                        next({etat:true, level:res[data.level-1]})
                                    });
                                })
                            })
                            .catch(err => {
                                next({etat:false,err:err});
                            })
                    }else{
                        collection.updateOne({user_id:data.user_id,game_id:data.game_id,level:data.level},
                            {$set:{nbre_tentative: succ.nbre_tentative+1}},
                            {upsert:true})
                            .then( good => {
                                mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                                    collection.find().toArray((err,res)=>{
                                        next({etat:true, level:res[data.level-1]})
                                    });
                                })
                            })
                            .catch(err => {
                                next({etat:true, err:err});
                            })
                    }
                })
            });
        });
    }

    static passLevel(data) {
        return new Promise(async next => {
            data.date_add = new Date();
            data.date_upd = new Date();
            data.status = true;
            await mongoose.connection.db.collection('memory_resultatparlevel',(err,collection)=>{
                collection.findOne({user_id:data.user_id,game_id:data.game_id,level:data.level}).then(succ => {
                    if(succ == null){
                        collection.insertOne(data)
                            .then(success => {
                                mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                                    collection.find().toArray((err,res)=>{
                                        next({etat:true, level:res[data.level]})
                                    });
                                })
                            })
                            .catch(err => {
                                next({etat:false,err:err});
                            })
                    }else{
                        collection.updateOne({user_id:data.user_id,game_id:data.game_id,level:data.level},
                            {$set:{nbre_tentative: succ.nbre_tentative+1,is_validate:true}},
                            {upsert:true})
                            .then( good => {
                                mongoose.connection.db.collection('memory_levelgame',(err,collection)=>{
                                    collection.find().toArray((err,res)=>{
                                        next({etat:true, level:res[data.level]})
                                    });
                                })
                            })
                            .catch(err => {
                                next({etat:true, err:err});
                            })
                    }
                })
            });
        });
    }

    static setGame(data) {
        return new Promise(async next => {
            const game = {
                id: data.id+1,
                user_id: data.user_id,
                game_id: data.game_id,
                date_debut: new Date(),
                date_fin_game: 0,
                status: true,
            };
            await mongoose.connection.db.collection('memory_timegame',(err,collection)=>{
               collection.findOne({user_id:data.user_id,game_id:data.game_id}).then(tab => {
                   if(tab == null){
                       collection.insert(game).then(suc => {
                           next({etat:true,resultat:suc});
                       }).catch(e => {
                           next({etat:false,e:e});
                       })
                   }else{
                       next({etat:"ok",resultat:"nothingToUpdate"})
                   }
               })

            });
        });
    }

    static setDateFin(data) {
        console.log(data);
        return new Promise(async next => {
            await   mongoose.connection.db.collection('memory_games',(err,collection)=>{
                collection.findOne({id:data.game_id}).then(Game => {
                    mongoose.connection.db.collection('memory_timegame',(err,collection)=>{
                        collection.updateOne({user_id:data.user_id,game_id:data.game_id},
                            {$set : {date_debut: new Date(),date_fin_game: Math.round(new Date().getTime() / 1000) + retourneSecondes(Game.duree_game)}},
                            {upsert:true})
                            .then( async game => {
                                next({etat:true,result:game});
                        })
                            .catch(err => {
                            next({etat:false,result:err});
                        })
                    });
                }).catch(err => {
                    next({etat:false,err:err});
                });
            })
        })
    }


    static getLastestLevel(data) {
        return new Promise(async next => {
            console.log(data);
            await mongoose.connection.db.collection("memory_timegame",(err,collection) => {
                collection.findOne({user_id:data.user_id,game_id:data.game_id}).then(data =>{
                   mongoose.connection.db.collection("memory_levelgame",(err,collection)=>{
                       collection.find().toArray((err,donnees)=>{
                           mongoose.connection.db.collection('memory_resultatparlevel',(err,collection)=>{
                               collection.find({user_id:data.user_id,game_id:data.game_id}).toArray((err,bigdata)=>{
                                   if(bigdata.length === 0){
                                       next({etat:true, time:data.date_fin_game,level:donnees[0]})
                                   }else{
                                       const level = bigdata[bigdata.length-1].is_validate === true ? bigdata[bigdata.length-1].level : bigdata[bigdata.length-1].level-1;
                                       next({etat:true, time:data.date_fin_game,level:donnees[level]})  
                                   }
                               });
                           });
                       })
                   })
                }).catch(err => {
                    next({etat:false,err:err});
                });
            })
          /*  await mongoose.connection.db.collection("memory_resultatparlevel",(err,collection)=>{
               collection.find({user_id:data.user_id,game_id:data.game_id}).toArray((err,data)=>{
                  mongoose.connection.db.collection('memory_levelgame',(err,collect1)=>{
                        collect1.find().toArray( (err,res)=>{
                             mongoose.connection.db.collection('memory_timegame',(err,collect2)=>{
                                collect2.findOne({user_id:data.user_id,game_id:data.game_id}).then(resu => {
                                    console.log(resu);
                                    if(data.length === 0){
                                        next({etat:true,time:resu.date_fin_game, level:res[0]});
                                    }else{
                                        next({etat:true,time:resu.date_fin_game, level:res[data[data.length-1].level]});
                                    }
                                }).catch(err => {
                                    next({etat:false, err:err});
                                })
                            });
                        });
                  });
               });
            }); */

           /* const user = await User.findById(data.user_id);
            const game = await Game.findById(data.game_id);
            const index = findGameIndex(user.games, data.game_id);
            if (user.games[index].levels.length === 0) {
                next({etat: true, level: game.levels[0]});
            } else {
                const latestlevel = user.games[index].levels[user.games[index].levels.length - 1];
                if (latestlevel.isValidate) {
                    next({etat: true, level: game.levels[latestlevel.niveau]})
                } else {
                    next({etat: true, level: game.levels[latestlevel.niveau - 1]});
                }
            } */
        })
    }

    static getModelsLength(data){
        return new Promise(async next => {
            await mongoose.connection.db.collection(data,(err,collection)=>{
                collection.find().toArray((err,data)=>{
                    console.log(data);
                    if(data.length === 0){
                        next(0);
                    }else{
                        const last = data[data.length-1];
                        console.log(last);
                        next(last.id);
                    }
                });
            });
        })
    }

    static endGame(data){
        return new Promise(async next => {
            await mongoose.collection.db.collection('memory_resultatparlevel',(err,collection)=>{
                collection.find({user_id:data.user_id,game_id:data.game_id}).toArray((err,resultats)=>{
                    let nombreTentatives = 0;
                    resultats.forEach(el => {
                        nombreTentatives += el.nbre_tentative;
                    });
                    let levelMax = resultats[resultats.length-1].is_validate === true ? resultats[resultats.length-1].level : resultats[resultats.length-2].level;
                    let pourcentage = 0;
                    let a_valide = false;
                    mongoose.collection.db.collection('memory_levelgame',(err,collection)=>{
                        collection.find().toArray((err,donnees)=>{
                            pourcentage = donnees.length * 100 / levelMax;
                        })
                    });
                    mongoose.collection.db.collection('memory_games',(err,collection)=>{
                        collection.findOne({game_id:data.game_id}).then(res => {
                            a_validee = levelMax > res.validation ? true : false;
                        });
                    });
                    mongoose.collection.db.collection('memory_resultatfinalgame',(err,collection)=>{
                        collection.insertOne({
                            id: data.id+1,
                            user_id: data.user_id,
                            game_id: data.game_id,
                            max_level: levelMax,
                            nbre_tentative_final: nombreTentatives,
                            a_valide : a_valide,
                            pourcentage: pourcentage,
                            date_add: new Date(),
                            date_upd: new Date(),
                            status: true
                        }).then( ok => {
                            next({etat:true, resultat: ok});
                        }).catch(err => {
                            next({etat:false,err:err});
                        });
                    });
                });
            });
        });
    }


};

const verify = (tab,id) => {
    let test = true;
    tab.forEach(el => {
       el.id_game === id ? test = false : '';
    });
    return test;
};

 const findGameIndex = (games,id) => {
    let output = 0;
    for(let i = 0; i < games.length; i++){
        if(games[i].id_game === id.toString()){
            output = i;
        }
    }
    return output;
};


const retourneSecondes = (int) => {
    const tab = int.split(':');
    if(parseInt(tab[0]) > 0){
        console.log(parseInt(tab[0])*3600+parseInt(tab[1])*60+parseInt(tab[2]))
        return parseInt(tab[0])*3600+parseInt(tab[1])*60+parseInt(tab[2]);
    }else if(parseInt(tab[1]) > 0){
        return parseInt(tab[1])*60+parseInt(tab[2]);
    }else{
        return parseInt(tab[2]);
    }
};
