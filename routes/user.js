const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      console.log("Body:", req.body);

      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser , (err) => {
        if(err){
          return next(err);
        }
        req.flash("success", "welcome to wanderLust");
        res.redirect("/listings");
      })
    } catch (e) {
      
      req.flash("error", e.message);
      res.redirect("/signup");
    }
    
  
  }
))

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login Request - POST
router.post(
  "/login",
  saveRedirectUrl, // Login ke baad kaha redirect karna hai wo save karega
  passport.authenticate("local", {
    failureRedirect: "/login", // Agar login fail ho to wapas login page
    failureFlash: true,        // Error flash message dikhaye
  }),
  (req, res) => {
    // Login success hone ke baad redirect karne ka logic
    const redirectUrl = res.locals.redirectUrl || "/listings"; // Session me saved URL ya default
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req , res , next) => {
  req.logout((err) => {
    if(err){
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");

  })
})



module.exports = router;
