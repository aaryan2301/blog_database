//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const authRouter = require("./router/authRoutes");
const mainRouter = require("./router/mainRouter");
const blogRouter = require("./router/blogRouter");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

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

//auth middleware
app.use("/auth",authRouter);
app.use("/",mainRouter);
app.use("/blog",blogRouter);

app.listen(process.env.port || 3000, function () {
  console.log("Server started on port 3000");
});
