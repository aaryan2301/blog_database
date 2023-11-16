const express = require("express");
const mainRouter = express.Router();
const {Post} = require("../public/models/model.js"); 

const homeStartingContent = "Welcome to Daily Journal: Your personal sanctuary for introspection and self-expression. Start each day with a blank canvas, where you can freely pour your thoughts, dreams, and emotions onto digital pages. Begin your journaling journey with Daily Journal today.";
const aboutContent = "At Daily Journal, our mission is to empower individuals in their personal growth journey through the practice of journaling. We provide a safe and private space for self-reflection, self-expression, and personal development.";
const contactContent = "Reach out to us for any inquiries, feedback, or collaboration opportunities. Connect with us today!";

mainRouter.get("/home", function (req, res) {
    if (req.isAuthenticated()) {
        
      Post.find({ user: req.user._id })
        .then(posts => {
          res.render("home", {
            homeStartingContent: homeStartingContent,
            posts: posts,
            user: req.user
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
    } else {
      res.render("home");
    }
  });

  mainRouter.get("/about", function (req, res) {
    res.render("about", { aboutContent: aboutContent, user: req.user });
  });
  
  mainRouter.get("/contact", function (req, res) {
    res.render("contact", { contactContent: contactContent, user: req.user });
  });

module.exports = mainRouter;