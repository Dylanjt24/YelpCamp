const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const campground = require('../models/campground');

// Comments New
router.get('/new', middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err || !campground) {
            req.flash('error', 'Campground not found');
            res.redirect('/campgrounds');
        } else {
            res.render('comments/new', {campground: campground});
        }
    });
});

// Comment Create
router.post('/', middleware.isLoggedIn, async (req, res) => {
    try {
        // Find campground to add comment to
        const campground = await Campground.findById(req.params.id);
        // Create a comment using data from the form
        const comment = await Comment.create(req.body.comment);
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        comment.save();
        campground.comments.push(comment);
        await campground.save();
        res.redirect('/campgrounds/' + campground._id);
    } catch(err) {
        req.flash('error', 'Something went wrong');
        console.log(err);
    }
});

// Comment Edit
router.get('/:comment_id/edit', middleware.checkCommentOwnership, async (req, res) => {
    try{
        const foundCampground = await Campground.findById(req.params.id);
        if (!foundCampground) {
            req.flash('error', 'Campground not found');
            res.redirect('/campgrounds');
        } else{
            const foundComment = await Comment.findById(req.params.comment_id);
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

// Comment Update
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, foundComment) => {
        if(err || !foundComment) {
            console.log(err.message);
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

// Delete Route
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if(err) {
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;