//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const homeStartingContent = "Welcome to Daily Journal: Your personal sanctuary for introspection and self-expression. Start each day with a blank canvas, where you can freely pour your thoughts, dreams, and emotions onto digital pages. Begin your journaling journey with Daily Journal today.";
const aboutContent = "At Daily Journal, our mission is to empower individuals in their personal growth journey through the practice of journaling. We provide a safe and private space for self-reflection, self-expression, and personal development.";
const contactContent = "Reach out to us for any inquiries, feedback, or collaboration opportunities. Connect with us today!";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });


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

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

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



app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/home");
  } else {
    res.render("authenticate");
  }
});

app.get("/home", function (req, res) {
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


app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/login");
  }
});

app.post("/compose", function (req, res) {
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


app.get("/posts/:postId", function (req, res) {
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

app.post("/delete", function (req, res) {
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

// app.get("/delete-account", function(req, res) {
//   // Render the delete account confirmation page
//   res.render("delete-account");
// });

app.post("/delete-account", function(req, res) {
  if (req.isAuthenticated()) {
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
  } else {
    res.redirect("/login");
  }
});




app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent, user: req.user });
});

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent, user: req.user });
});

app.get("/login", function (req, res) {
  res.render("login", { message: null });
});

app.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("An error occurred");
    }
    res.redirect('/');
  });
});


app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.log(err);
      return res.status(500).send("An error occurred");
    }

    if (!user) {
      // Authentication failed, display error message
      return res.render("login", { message: "Invalid username or password/User doesn't exist." });
    }

    req.login(user, function (err) {
      if (err) {
        console.log(err);
        return res.status(500).send("An error occurred");
      }
      return res.redirect("/home");
    });
  })(req, res, next);
});


app.get("/register", function(req, res) {
  res.render("register", { message: null, username: "" });
});


app.post("/register", function(req, res) {
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
            res.redirect("/login");
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


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
