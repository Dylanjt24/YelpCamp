const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Root Route
router.get("/", (req, res) => {
    res.render("landing");
});

// Show register form
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'});
});

// Handles sign up logic
router.post("/register", async (req, res) => {
   try {
        const newUser = new User({ username: req.body.username });
        await User.register(newUser, req.body.password);
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Welcome to YelpCamp ' + newUser.username);
            res.redirect('/campgrounds')});
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
});

// Show login form
router.get('/login', (req, res) => {
    res.render('login', {page: 'login'});
});

// Handles login logic
router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login'
    }), (req, res) => {
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out!');
    res.redirect('/campgrounds');
});

module.exports = router;