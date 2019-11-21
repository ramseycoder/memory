const mongoose = require('mongoose');
const connection = async () =>{
    try{
        let connect = mongoose.connection
        await mongoose.connect('mongodb://51.77.197.177:27017/candidaturenan',{
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log(('connected'));
       /* connect.db.collection('memory_resultatparlevel',(err,collection)=>{
            collection.deleteMany({nbre_tentative:NaN}) .then(resu => {
                console.log(resu)
            }).catch(err => {
                console.log(err);
            })
        }); */
        connect.db.collection('memory_resultatparlevel',(err,collection)=>{
            collection.find().toArray((err,data)=> {
                console.log(data)
            });
        });
    }catch(e){
        console.log("err"+e);
    }
};
module.exports = connection;