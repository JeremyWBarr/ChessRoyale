var express 		= require('express');
var session 		= require('express-session');
var path 			= require('path');
var bodyParser 		= require('body-parser');
var ejs 			= require('ejs');
var mongoose 		= require('mongoose');
var MongoStore 		= require('connect-mongo')(session);
var engines 		= require('consolidate');
var app 			= express();

/*mongoose.connect('mongodb://localhost/ManualAuth');

// Mongoose connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});*/

// Session storage
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false/*,
  store: new MongoStore({
    mongooseConnection: db
  })*/
}));

// Setup views
app.set('views', path.join(__dirname, 'views'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/views'));

var index = require('./routes/index');
app.use('/', index);

// Forward 404 to error handler
app.use(function (req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// Error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
});


// Listen on port 80
app.listen(80, function () {
	console.log('listening *:80');
});