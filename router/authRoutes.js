const express = require("express");
const authRouter = express.Router();
const passport = require("../public/passport");
const bcrypt = require("bcrypt");
const {Post, User} = require("../public/models/model.js");

authRouter.post("/delete-account", function(req, res) {
      const userId = req.user._id;
      // Delete all posts associated with the user
      Post.deleteMany({ user: userId })
        .then(() => {
          // Delete the user
          return User.findByIdAndRemove(userId);
        })
        .then(() => {
          req.logout(function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send("An error occurred");
            }
            // Redirect to the home page or a confirmation page
            res.redirect("/"); // Replace "/" with the desired destination URL
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
  });

  authRouter.get("/login", function (req, res) {
    res.render("login", { message: null });
  });
  
  authRouter.get('/logout', function (req, res) {
    req.logout(function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("An error occurred");
      }
      res.redirect('/');
    });
  });
  
  
  authRouter.post("/login", function (req, res, next) {
    
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        console.log(err);
        return res.status(500).send("An error occured");
      }
  
      if (!user) {
        // Authentication failed, display error message
        return res.render("login", { message: "Invalid username or password/User doesn't exist." });
      }
  
      req.login(user, function (err) {
        if (err) {
          
          console.log(err);
          return res.status(500).send("An error");
        }
        return res.redirect("/home");
      });
    })(req, res, next);
  });
  
  
  authRouter.get("/register", function(req, res) {
    res.render("register", { message: null, username: "" });
  });
  
  
  authRouter.post("/register", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
    User.findOne({ username: username })
      .then(existingUser => {
        if (existingUser) {
          // User with the same username already exists
          return res.render("register", { message: "Username already exists", username: "" });
        }
  
        bcrypt.hash(password, 10, function(err, hash) {
          const newUser = new User({
            username: username,
            password: hash
          });
  
          newUser.save()
            .then(() => {
              res.redirect("/auth/login");
            })
            .catch(err => {
              console.log(err);
              res.status(500).send("An error occurred");
            });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send("An error occurred");
      });
  });

  module.exports = authRouter;