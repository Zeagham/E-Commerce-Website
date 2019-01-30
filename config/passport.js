var localStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var usermodel = require('../models/user');

module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: 'email'},   function (email, password, done) {
        console.log(password);
        // Match user
        usermodel.findOne({email: email}).then(function (user) {
            if (!user) {
                return done(null, false, {message: 'No User Found'});
            }

// Match password
            bcrypt.compare(password, user.password,function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Password Incorrect'});
                }
            })
        })
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        usermodel.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
