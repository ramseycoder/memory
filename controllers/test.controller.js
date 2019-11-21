const User = require('../models/users.model');

exports.userQueries = class{

    static getAllClients(){
        return new Promise(async next => {
            await User.find().then(user => {
                next({etat:true,user:user});
            }).catch(e =>{
                next({etat:false,err:e});
            })
        })
    }
}