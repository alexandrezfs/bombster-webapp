// Require our dependencies
var express = require('express'),
    handlebars = require('handlebars'),
    exphbs = require('express-handlebars'),
    layouts = require('handlebars-layouts'),
    http = require('http'),
    routes = require('./routes'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    multer  = require('multer'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    auth = require('./auth');

// Create an express instance and set a port variable
var app = express();
var port = config.values.port;
handlebars.registerHelper(layouts(handlebars));

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
app.engine('handlebars', exphbs({defaultLayout: 'landing'}));
app.set('view engine', 'handlebars');

app.get('/', routes.index);
app.get('/signup', routes.signup);
app.post('/signup', routes.signupProcess);
app.get('/login', routes.login);
app.post('/login', routes.loginProcess);
app.get('/password/recover', routes.passwordRecover);
app.post('/password/recover', routes.passwordRecoverProcess);
app.get('/password/recover/success', routes.passwordRecoverSuccess);
app.get('/password/reset/:token', routes.passwordReset);
app.post('/password/reset', routes.passwordResetProcess);
app.get('/password/reset-success', routes.passwordResetSuccess);
app.get('/dashboard', auth.authMiddleware, routes.dashboard);
app.post('/question/add', routes.addQuestion);
app.get('/q/:question_slug', routes.question);
app.post('/vote', routes.addVote);


//Redirect no 200 status to /
app.use(function (req, res, next) {
    if (res.status != 200) {
        res.render('404', {layout: 'admin'});
    }
});

// Fire it up (start our server)
http.createServer(app).listen(port, function () {
    console.log('Express server listening on port ' + port);
});