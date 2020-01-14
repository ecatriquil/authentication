const express = require('express'),
        mongoose = require('mongoose'),
        passport = require('passport'),
        bodyParser = require('body-parser'),
        User = require('./models/user'),
        LocalStrategy = require('passport-local'),
        passportLocalMongoose = require('passport-local-mongoose'),
        app = express();

mongoose.connect('mongodb://localhost/auth_demo_app', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(require('express-session')({
    secret:'Secret',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req,res){
    res.render('secret');
});

app.get('/register', function(req,res){
    res.render('register');
});

app.post('/register', function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect('/secret');
        });
    });
});


app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function(req,res){});

app.get('/logout', function(req,res){
    req.logOut();
    res.redirect('/');
});


function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    } 

    res.redirect('/login');
}

const port = process.env.port || 5000;
app.listen(port, console.log(`Server started at port ${port}`));