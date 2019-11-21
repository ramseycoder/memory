const server = require('./server');
const serveur = new server();
const app = serveur.getApp();
const db = require('./settings/database');
const http = require('http').createServer(app);

const {userQueries} = require('./controllers/user.controller');
const {gameQueries} = require('./controllers/game.controller');
const {functions} = require('./controllers/random');
const memoryGame = require('./docs/jeuximages');

db();

const io = require('socket.io')(http);

let compt = 0;
const home = io.of('/');
home.on('connection',async (socket)=>{
    socket.on('next',(data)=>{
        socket.emit('next',data);
    })
});


const register = io.of('/user-register');
register.on('connection',(socket)=>{
   console.log('user connected');
   socket.on('user-register', async (data)=>{
       const resu = await userQueries.setUser(data);
       if(resu.user!= null){
           socket.emit('user-register',resu.user);
       }
   })
});

const login = io.of('/user-login').use(serveur.getSharedSession());
login.on('connection',(socket)=>{
    console.log('user connected');
    socket.on('user-login', async (data)=>{
        const resu = await userQueries.getUser(data);
        if(resu.user != null){
            socket.handshake.session.game = resu.user;
            socket.handshake.session.save();
            socket.emit('user-login');
        }else{
            socket.emit('user-not-found');
        }
    })
});

const game = io.of('/nan_games/games').use(serveur.getSharedSession());
game.on('connection',(socket)=>{
    console.log('user connected');
    compt = 0;
    socket.on('begin_game', async (data)=>{
        const latest = await userQueries.getModelsLength("memory_timegame");
        console.log(latest);
        data.id = latest;
        console.log(data);
        const resu = await userQueries.setGame(data);
        if(resu.resultat != null){
            console.log(resu.resultat);
            socket.emit('begin_game',data);
        }
    })
});

const memory = io.of('/nan_games/games/memory').use(serveur.getSharedSession());
memory.on('connection',async (socket)=>{
    socket.on('sessionkeep',async ()=>{
        const data = {
            user_id: socket.handshake.session.game.id,
            game_id: socket.handshake.session.game.game_id,
        };
        const res = await userQueries.getLastestLevel(data);
        socket.emit('gameInstance',convertSecondes(res.time  - Math.round(new Date().getTime() / 1000)),res.level);
    })
    compt++;
    let tentatives = {};
   /* if(compt >= 2){
        const data = {
            user_id: socket.handshake.session.game.id,
            game_id: socket.handshake.session.game.game_id,
        };
        const res = await userQueries.getLastestLevel(data);
        socket.emit('gameInstance',convertSecondes(res.time  - Math.round(new Date().getTime() / 1000)),res.level);
    } */
    socket.on('begin_game_memory',async ()=>{
        const data = {
            user_id: socket.handshake.session.game.id,
            game_id: socket.handshake.session.game.game_id,
        };
        const resu = await userQueries.setDateFin(data);
        const res = await gameQueries.getLevel({level:0,game:socket.handshake.session.game.game_id});
        console.log(res.duree);
        if(res.level != null){
            socket.emit('begin_game_memory',res.duree,res.level);
        }
    });

    socket.on('passlevel',async (niveau)=>{
        let data = {};
        const d = await userQueries.getModelsLength('memory_resultatparlevel')
        if(tentatives.user_id === undefined){
            data = {
                id: d+1,
                user_id: socket.handshake.session.game.id,
                game_id:socket.handshake.session.game.game_id,
                level: niveau,
                nbre_tentative: 1
            };
        }else{
            data = tentatives;
            data.id = d+1;
            data.nbre_tentative += 1;
        }
        console.log(data);
        const res = await userQueries.passLevel(data);
        if(res.level != null){
            tentatives = {};
            socket.emit('passlevel',res.level);
        }
    });


    socket.on('setTentative',async (niveau)=>{
       let d =  await userQueries.getModelsLength('memory_resultatparlevel');
        const data = {
            level: niveau-1,
            game: socket.handshake.session.game.game_id,
        };
        if(tentatives.user_id == undefined){
            tentatives.id = d+1;
            tentatives.user_id = socket.handshake.session.game.id;
            tentatives.game_id = socket.handshake.session.game.game_id;
            tentatives.level = niveau;
            tentatives.nbre_tentative = 1;
        }else{
            tentatives.id = d+1;
            tentatives.nbre_tentative += 1;
        }
        console.log(tentatives);
        const res = await gameQueries.getLevel(data);
        if(res.level != null){
            socket.emit('setTentative',res.level);
        }
    });
});

const convertSecondes = (secondes)=>{
    if(secondes > 3600){
        return parseInt(secondes/3600)+":"+parseInt((secondes % 3600) / 60)+":"+((secondes % 3600) % 60)
    }else if(secondes > 60){
        return "00:"+parseInt(secondes / 60) +":"+(secondes % 60)
    }else{
        return "00:00:"+secondes;
    }
};

http.listen(3000,()=>{
    console.log("j'écoute sur le port 3000");
});