//Dependencies
const mongodb = require('mongodb');
//Mongodb connection
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/locateit';

//Frontpage
module.exports.frontpage = function(req, res){
  var user = req.params.user;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('places');
      collection.find({}).toArray(function(err, places){
        if(err){
          throw err;
        }else{
          res.render('logged/frontpage.jade', {
            places: places,
            user: user
          });
        }
      });
    }
  });
}
