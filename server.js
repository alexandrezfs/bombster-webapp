// Require our dependencies
var express = require('express'),
    exphbs = require('express-handlebars'),
    http = require('http'),
    routes = require('./routes'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    multer  = require('multer'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

// Create an express instance and set a port variable
var app = express();
var port = config.values.port;

app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(session({secret: 'token'}));
app.use(bodyParser());
app.use(cookieParser());
app.use(multer({ dest: __dirname + '/public/upload/'}));

// Set handlebars as the templating engine
app.use("/", express.static(__dirname + "/public/"));
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', routes.index);
app.get('/signup', routes.signup);
app.post('/signup', routes.signupProcess);
app.get('/login', routes.login);
app.post('/login', routes.loginProcess);
app.get('/password/recover', routes.passwordRecover);
app.post('/password/recover', routes.passwordRecoverProcess);
app.get('/password/recover/success', routes.passwordRecoverSuccess);


//Redirect no 200 status to /
app.use(function (req, res, next) {
    if (res.status != 200) {
        res.render('404');
    }
});

// Fire it up (start our server)
var server = http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});