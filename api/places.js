//Adding dependencies
const mongodb = require('mongodb');
const moment = require('moment');
//Mongodb connection
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/locateit';

// The controller that shows an api over all the places in the database
module.exports.getAll = function(req, res){
  mongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      }else{
        var collection = db.collection('places');
        collection.find({}).toArray(function(err, places){
          if(err){
            throw err;
          }else{
            res.status(200).send(places);
            db.close();
          }
        });
      }
  });
};
// The CRUD for a single place
module.exports.getOne = function(req, res){
  var title = req.params.title;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('places');
      collection.find({'title': title}).toArray(function(err, place){
        if(err){
          throw err;
        }else{
          res.status(200).send(place[0]);
          db.close();
        }
      });
    }
  });
};
module.exports.insertOne = function(req, res){
  // Get the keywords from string to an array
  var keywords = req.body.tags.split(',');
  // Setting the opening an closing hours. If closed it returns 'closed'
  var openH = function(dayO, dayC){
    if((dayO === 'closed') || dayC === 'closed'){
      return 'closed';
    }else{
      return dayO + '-' + dayC;
    }
  };
  // The object that will be inserted to mongoDB
  var place = {
    title: req.body.title,
    description: req.body.description,
    coords: {
      lat: req.body.lat,
      lng: req.body.lng
    },
    open: {
      weekdays: openH(req.body.weekdayOpen, req.body.weekdayClosed),
      friday: openH(req.body.fridayOpen, req.body.fridayClosed),
      saturday: openH(req.body.saturdayOpen, req.body.saturdayClosed),
      sunday: openH(req.body.sundayOpen, req.body.sundayClosed)
    },
    keys: keywords
  };
  // Connect to mongo, insert and close the db
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      collection = db.collection('places');
      collection.insertOne(place, function(err, result){
        if(err){
          throw err;
        }else{
          res.status(201).send(result.ops);
          db.close();
        }
      });
    }
  });
}
module.exports.removeOne = function(req, res){
  var title = req.params;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      collection = db.collection('places');
      collection.deleteOne({'title': title.title}, function(err, deleted){
        if(err){
          throw err;
        }else{
          res.status(200).send(deleted.ops);
          db.close();
        }
      })
    }
  });
};
module.exports.updateOne = function(req, res){
  var title = req.params.title;
  var updated = req.body;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      collection = db.collection('places');
      collection.updateOne({'title': title}, {'$set': updated}, function(err, update){
        if(err){
          throw err;
        }else{
          res.status(200).send(update);
          db.close();
        }
      });
    }
  });
};
