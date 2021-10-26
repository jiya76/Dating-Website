const express = require('express');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const res = require('express/lib/response');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
//Load models
const Message = require('./models/message');
const User = require('./models/user');
const path = require('path');
const app = express();
//load keys file
const Keys = require('./config/key');
//load helpers
const{requireLogin,ensureGuest}=require('./helpers/auth')
//use body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: false
}))
// confirguration for authentication
app.use(cookieParser());
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//make user global object
app.use((req,res, next) => {
    res.locals.user = req.user || null;
    next();
});
//load fb strategy
require('./passport/facebook');
require('./passport/google');
//connect to mLab Mongoose
mongoose.connect(Keys.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Server is connected to MongoDB');
}).catch((err) => {
    console.log(err);
});
//env varible for port
const port = process.env.PORT || 3000;

//setup view engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');


app.get('/',ensureGuest, (req, res) => {
    res.render('home');
    title:'Home'

});

app.get('/about',ensureGuest, (req, res) => {
    res.render('about');
    title:'About'
});

app.get('/contact',ensureGuest, (req, res) => {
    res.render('contact');
    title:'Contact'
});

app.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['email']    
}));
app.get('/auth/facebook/callback', passport.authenticate('facebook',{
    successRedirect: '/profile',
    failureRedirect: '/'
}));
app.get('/auth/google', passport.authenticate('google',{
    scope: ['profile']
}));
app.get('/auth/google/callback', passport.authenticate('google',{
    successRedirect: '/profile',
    failureRedirect: '/'
}));
app.get('/profile',requireLogin,(req,res) => {
    User.findById({_id:req.user._id}).then((user) => {
        if (user) {
            user.online = true;
            user.save((err,user) => {
                if (err) {
                    throw err;
                }else{
                    res.render('profile', {
                        title: 'Profile',
                        user: user
                    });
                }
            })
        }
    });
});

app.get('/logout',(req,res) => {
    User.findById({_id:req.user._id})
    .then((user) => {
        user.online = false;
        user.save((err,user) => {
            if (err) {
                throw err;
            }
            if (user) {
                req.logout();
                res.redirect('/');
            }
        })
    })
});

app.post('/contactUs', (req, res) => {
    console.log(req.body);
    const newMessage = {
        fullname: req.body.fullname,
        email: req.body.email,
        message: req.body.message,
        date: new Date()
    }
    new Message(newMessage).save((err, message) => {
        if (err) {
            throw err;
        } else {
            Message.find({}).then((messages) => {
                if (messages) {
                    res.render('newmessage', {
                        title: 'Sent',
                        messages: messages
                    });
                } else {
                    res.render('noMessage', {
                        title: 'Not Found'
                    });
                }
            });
        }
    });
});
app.listen(port, () => {
    console.log(`server is running on port ${port}`);

});
