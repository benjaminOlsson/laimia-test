//Adding dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const moment = require('moment');

//Adding routes
const api = require('./routes/api');
const front = require('./routes/front');
const logged = require('./routes/logged');

//Adding the express function as app.
const app = express();

/*** Middlevare ***/
//Setting the view engine to jade
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Adding the body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Adding middleware for static pages
app.use(express.static(path.join(__dirname, 'public')));

/**** Pages ****/
//Api
app.use('/api', api);
//Before login
app.use('/', front)
//After login
app.use('/user', logged);

app.listen(8080, function(){console.log('Working on port 8080');});
