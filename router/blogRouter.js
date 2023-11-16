const express = require("express");
const blogRouter = express.Router();
const {Post} = require("../public/models/model.js");

blogRouter.get("/compose", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("compose");
    } else {
      res.redirect("/login");
    }
  });
  
  blogRouter.post("/compose", function (req, res) {
    if (req.isAuthenticated()) {
      const post = new Post({
        title: req.body.postTitle,
        content: req.body.postBody,
        user: req.user._id
      });
  
      post.save()
        .then(() => {
          res.redirect("/home");
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
    } else {
      res.redirect("/login");
    }
  });
  
  
  blogRouter.get("/posts/:postId", function (req, res) {
    if (req.isAuthenticated()) {
      const requestedPostId = req.params.postId;
      Post.findOne({ _id: requestedPostId, user: req.user._id })
        .then(post => {
          if (!post) {
            res.status(404).send("Post not found");
            return;
          }
          res.render("post", {
            title: post.title,
            content: post.content,
            user: req.user
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
    } else {
      res.redirect("/login");
    }
  });
  
  blogRouter.post("/delete", function (req, res) {
    if (req.isAuthenticated()) {
      const requestedPostId = req.body.postId;
      Post.findByIdAndRemove(requestedPostId)
        .then(() => {
          res.redirect("/home");
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
    } else {
      res.redirect("/login");
    }
  });

  module.exports = blogRouter;