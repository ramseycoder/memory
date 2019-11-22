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
        connect.db.collection('memory_resultatfinalgame',(err,collection)=>{
            collection.find({}) .toArray((err,resu) => {
                console.log(resu)
            })
        });
    }catch(e){
        console.log("err"+e);
    }
};
module.exports = connection;