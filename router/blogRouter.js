const express = require("express");
const blogRouter = express.Router();
const {Post} = require("../public/models/model.js");

blogRouter.get("/compose", function (req, res) {
      res.render("compose");
  });
  
  blogRouter.post("/compose", function (req, res) {
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
  });
  
  
  blogRouter.get("/posts/:postId", function (req, res) {
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
  });
  
  blogRouter.post("/delete", function (req, res) {
      const requestedPostId = req.body.postId;
      Post.findByIdAndRemove(requestedPostId)
        .then(() => {
          res.redirect("/home");
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("An error occurred");
        });
  });

  module.exports = blogRouter;