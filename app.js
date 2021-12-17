//jshint esversion:6

require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const encrypt = require('mongoose-encryption');
// const bcrypt = require('bcrypt');
// const md5 = require('md5');

const app = express();

app.use(express.static('Private'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
    secret: 'This is Sreeshanth',
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});
// mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;
const userSchema = new Schema ({
    email : String,
    password : String
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get

app.get('/', function(req, res){
    res.render('home');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/secrets', function(req, res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }
    else res.redirect('/login'); 
});

// app.post 
app.post('/register', function(req, res){
    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect('/register') 
        }
        else {
            passport.authenticate('local',)(req, res, function(){
                res.redirect('/secrets');
            });
        }
          // Value 'result' is set to false. The user could not be authenticated since the user is not active
    });
});

app.post('/login', function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err) console.log(err);
        else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secrets');
            });
        }
    });
});

// const saltRounds = 10;
// app.post('/login', function(req, res){
//     username = req.body.username;
//     password = (req.body.password);

    

//     User.findOne({email: username}, function(err, foundOne){
//         if(err)
//             res.send(err);
//         else   
//             if (foundOne){
//                 bcrypt.compare(password, foundOne.password, function(err, result) {
//                     res.render("secrets");
//                 });       
//             }
//     });
// });

// app.post('/register', function(req, res){

//     bcrypt.hash(req.body.username, saltRounds, function(err, hash) {
//         const newUser = new User({
//             email: req.body.username,
//             password: hash
//         });
    
//         newUser.save(function(err){
//             if (!err)
//                 res.render('secrets');
//             else   
//                 res.send(err);
//         });
//     });    
// });

app.listen(3000, function(){
    console.log('Server Started in Server 3000!!');
});
