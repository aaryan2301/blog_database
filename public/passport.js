const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {User} = require("../public/models/model.js");
const bcrypt = require("bcrypt");
// Configure passport local strategy
passport.use(
    new LocalStrategy(function (username, password, done) {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }
          bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Incorrect password." });
            }
          });
        })
        .catch((err) => {
          return done(err);
        });
    })
  );
  
  // Serialize and deserialize user for session management
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function (id, done) {
    User.findById(id).exec()
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err, null);
      });
  });

  module.exports = passport;