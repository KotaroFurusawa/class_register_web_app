const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models').Users;

passport.use(new LocalStrategy({
    usernameField: 'club_id',
    passwordField: 'password'
}, (club_id, password, done) => {

    User.findOne({
        where: {
            club_id: club_id
        }
    })
        .then(user => {

            if (user && bcrypt.compareSync(password, user.password)) {

                return done(null, user);  // ログイン成功

            }

            throw new Error();

        })
        .catch(error => { // エラー処理

            return done(null, false, { message: '認証情報と一致するレコードがありません。' });

        });

}));

// Session
passport.serializeUser((user, done) => {

    done(null, user);

});
passport.deserializeUser((user, done) => {

    done(null, user);

});

module.exports = passport;