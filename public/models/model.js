const mongoose = require('mongoose');

const postSchema = {
    title: String,
    content: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  };
  
  const userSchema = {
    username: String,
    password: String
  };
  
  const Post = mongoose.model("Post", postSchema);
  const User = mongoose.model("User", userSchema);

  module.exports = {Post, User};