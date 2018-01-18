// Dependencies
const mongodb = require('mongodb');
//Mongodb connection
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017/locateit';

//Get all users
module.exports.getAll = function(req, res){
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('users');
      collection.find({}).toArray(function(err, users){
        if(err){
          throw err;
        }else{
          res.status(200).send(users);
          db.close();
        }
      });
    }
  });
}
//The CRUD for a single user
module.exports.getOne = function(req, res){
  var username = req.params.username;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('users');
      collection.find({'username': username}).toArray(function(err, user){
        if(err){
          throw err;
        }else{
          res.status(200).send(user[0]);
          db.close();
        }
      });
    }
  });
};
module.exports.insertOne = function(req, res){
  var tags = req.body.tags.split(',');
  for(let i = 0; i < tags.length; i++){
    tags[i] = tags[i].replace(/\s/g, '');
  }
  var user = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    age: req.body.age,
    gender: req.body.gender,
    address: req.body.address,
    city: req.body.city,
    postCode: req.body.postCode,
    email: req.body.email,
    password: req.body.password,
    tags: tags,
    favorites: []
  };
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('users');
      collection.insertOne(user, function(err, user){
        if(err){
          throw err;
        }else{
          res.status(201).send(user);
          db.close();
        }
      });
    }
  });
}
module.exports.removeOne = function(req, res){
  var username = req.params.username;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('users');
      collection.deleteOne({'username': username}, function(err, deleted){
        if(err){
          throw err;
        }else{
          res.status(200).send(deleted.ops);
          db.close();
        }
      });
    }
  });
};
module.exports.updateOne = function(req, res){
  var username = req.params.username;
  var updated = req.body;
  if(updated.method === 'add'){
    delete updated['method'];
    mongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      }else{
        var collection = db.collection('users');
        collection.updateOne({'username': username}, {'$push': updated}, function(err, update){
          if(err){
            throw err;
          }else{
            res.status(200).send(update);
            db.close();
          }
        })
      }
    });
  }else if(updated.method === 'remove'){
    delete updated['method'];
    mongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      }else{
        var collection = db.collection('users');
        collection.updateOne({'username': username}, {'$pull': updated}, function(err, update){
          if(err){
            throw err;
          }else{
            res.status(200).send(update);
            db.close();
          }
        })
      }
    });
  }else if(updated.method === 'update'){
    delete updated['method'];
    mongoClient.connect(url, function(err, db){
      if(err){
        throw err;
      }else{
        var collection = db.collection('users');
        collection.updateOne({'username': username}, {'$set': updated}, function(err, update){
          if(err){
            throw err;
          }else{
            res.status(200).send(update);
            db.close();
          }
        })
      }
    });
  }
};
// Api for verifying the user login
module.exports.login = function(req, res){
  var username = req.query.username;
  mongoClient.connect(url, function(err, db){
    if(err){
      throw err;
    }else{
      var collection = db.collection('users');
      collection.find({'username': username}).toArray(function(err, user){
        if(err){
          throw err;
        }else{
          if(user.length === 1){
            res.redirect('/user/' + user[0].username);
          }else{
            res.send('The user is not found');
          }
        }
      });
    }
  });
};
