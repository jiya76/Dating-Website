const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const keys = require('../config/key');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: keys.FacebookAppID,
    clientSecret: keys.FacebookAppSecret,
    profileFields: ['email','displayName','photos'],
    callbackURL: 'https://serene-meadow-24485.herokuapp.com/',
    proxy:true

},
    function (accessToken, refreshToken, profile, done){
    console.log(profile);
    User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, user);
        } else {
            const newUser = {
                facebook: profile.id,
                fullname: profile.displayName,
                lastname: profile.name.familyName,
                firstname: profile.name.givenName,
                image: `https://graph.facebook.com/${profile.id}?type=large`,
                email: profile.emails[0].value
            }
            new User(newUser).save((err,user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null,user);
                }
            });
        }
    });
}));