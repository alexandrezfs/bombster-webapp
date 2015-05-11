var formValidator = require('./form_validation');
var bcrypt = require('bcrypt');
var model = require('./model');
var uuid = require('node-uuid');
var email_interface = require('./email_interface');
var config = require('./config');
var slug = require('slug');
var shortid = require('shortid');
var gravatar = require('gravatar');
var uploader = require('./upload');

module.exports = {

    index: function (req, res) {

        res.render('index', {layout: 'landing'});
    },

    signup: function (req, res) {

        res.render('signup', {layout: 'landing'});
    },

    signupProcess: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;
        var username = req.body.username;

        var formValues = {
            email: email,
            password: password,
            username: username
        };

        formValidator.FormValidator.validateSignupForm(formValues, function (errors) {

            if (errors.length > 0) {

                res.render('signup', {formValues: formValues, errors: errors, layout: 'landing'});
            }
            else {

                bcrypt.hash(formValues.password, 10, function (err, hash) {

                    var user = {
                        password: hash,
                        username: formValues.username,
                        email: formValues.email,
                        is_account_activated: false,
                        token: uuid.v4()
                    };

                    new model.ModelContainer.UserModel(user).save(function (err, u) {

                        req.session.username = u.username;

                        //Send a mail
                        email_interface.sendMailWithTemplate(
                            "",
                            "",
                            config.values.mandrill_templates['bombster-signup-success'].name,
                            config.values.email_system_address,
                            "Bombster.io",
                            u.email,
                            config.values.mandrill_templates['bombster-signup-success'].slug,
                            [{name: "USERNAME", content: u.username}],
                            function (response) {
                                console.log(response);
                            });

                        res.redirect('/dashboard');

                    });
                });

            }

        });

    },

    login: function (req, res) {

        if (req.session.username) {

            res.redirect('/dashboard');
        }
        else if (req.cookies._id) {

            model.ModelContainer.UserModel.findOne({_id: req.cookies._id}, function (err, user) {

                if (user) {

                    //Update login date
                    user.last_login = new Date();
                    user.save();

                    req.session.username = user.username;

                    res.redirect('/dashboard');
                }

            });

        }
        else {
            res.render('login', {layout: 'account'});
        }

    },

    loginProcess: function (req, res) {

        var login = req.body.login;
        var password = req.body.password;
        var remember = req.body.remember;

        var errors = [];

        model.ModelContainer.UserModel.findOne({$or: [{username: login}, {email: login}]}, function (err, user) {

            if (!user) {
                errors.push('Your login / password are not recognized.');
                res.render('login', {errors: errors, layout: 'account'});
            }
            else {

                bcrypt.compare(password, user.password, function (err, result) {

                    if (result === true) {

                        //Update login date
                        user.last_login = new Date();
                        user.save();

                        req.session.username = user.username;

                        if (remember) {
                            res.cookie('_id', user._id, {maxAge: 900000, httpOnly: true});
                        }

                        res.redirect('/dashboard');
                    }
                    else {
                        errors.push('Password is not correct');
                        res.render('login', {errors: errors, layout: 'account'});
                    }

                });

            }

        });
    },

    passwordRecover: function (req, res) {

        res.render('password_recover', {layout: 'landing'});
    },

    passwordRecoverProcess: function (req, res) {

        var email = req.body.email;
        var errors = [];

        model.ModelContainer.UserModel.findOne({email: email}, function (err, user) {

            if (!user) {
                errors.push('This email does not match with any account.');
                res.render('password_recover', {errors: errors, layout: 'landing'});
            }
            else {

                var host = req.get('host');
                var protocol = req.protocol;
                var link = protocol + '://' + host + '/password/reset/' + user.token;

                email_interface.sendMailWithTemplate(
                    "",
                    "",
                    config.values.mandrill_templates['password-reset-link'].name,
                    config.values.email_system_address,
                    "Bombster.io",
                    user.email,
                    config.values.mandrill_templates['password-reset-link'].slug,
                    [{name: "USERNAME", content: user.username}, {name: "LINK", content: link}],
                    function (response) {
                        console.log(response);
                    });

                res.redirect('/password/recover/success');

            }

        });
    },

    passwordRecoverSuccess: function (req, res) {

        res.render('password_recover_success', {layout: 'landing'});
    },

    passwordReset: function (req, res) {

        var token = req.params.token;

        model.ModelContainer.UserModel.findOne({token: token}, function (err, user) {

            if (user) {
                res.render('password_reset', {user: user, layout: 'landing'});
            }
            else {
                res.redirect('/');
            }

        });

    },

    passwordResetProcess: function (req, res) {

        var password = req.body.password;
        var passwordC = req.body.passwordC;
        var token = req.body.token;

        var formValues = {
            password: password,
            passwordC: passwordC
        };

        formValidator.FormValidator.validateResetPasswordForm(formValues, function (errors) {

            if (errors.length === 0) {

                model.ModelContainer.UserModel.findOne({token: token, is_deleted: false}, function (err, user) {

                    bcrypt.hash(formValues.password, 10, function (err, hash) {

                        user.password = hash;
                        user.token = uuid.v4();
                        user.save();

                        email_interface.sendMailWithTemplate(
                            "",
                            "",
                            config.values.mandrill_templates['password-reset-success'].name,
                            config.values.email_system_address,
                            "Bombster.io",
                            user.email,
                            config.values.mandrill_templates['password-reset-success'].slug,
                            [{name: "USERNAME", content: user.username}],
                            function (response) {
                                console.log(response);
                            });

                        res.redirect('/password/reset-success');

                    });
                });
            }
            else {
                res.render('password_reset', {errors: errors, layout: 'landing'});
            }

        });
    },

    passwordResetSuccess: function (req, res) {

        res.render('password_reset_success', {layout: 'landing'});
    },

    dashboard: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            model.ModelContainer.TimelineModel.find({
                user: user._id,
                is_deleted: false
            })
                .sort({created_at: -1})
                .limit(10)
                .populate('user')
                .populate('question')
                .exec(function (err, timelineItems) {

                    console.log(timelineItems);

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    res.render('dashboard', {
                        user: user,
                        timelineItems: timelineItems,
                        layout: 'admin',
                        gravatar_url: gravatar_url
                    });

                });

        });

    },

    upload: function (req, res) {

        var image = req.files.file.name;

        if (image) {

            uploader.upload('public/upload/' + image, image, function (response) {

                console.log(response);
                res.json(response);

            });
        }
    },

    addQuestion: function (req, res) {

        var question_title = req.body.question_title;
        var image = req.body.image;
        var question_slug = slug(question_title);
        var question_identifier = shortid.generate();
        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            var question = {
                question_title: question_title,
                question_slug: question_slug,
                question_identifier: question_identifier,
                image: image,
                user: user._id,
                user_username: user.username
            };

            model.ModelContainer.QuestionModel(question).save(function (err, q) {

                //Add to timeline
                var timeline = {
                    user: user._id,
                    type: "post-question",
                    question: q._id,
                    title: 'post-question',
                    content: q.question_title,
                    image: q.image,
                    url: '/q/' + q.question_identifier
                };

                model.ModelContainer.TimelineModel(timeline).save(function (err, t) {

                    res.json(t);

                });

            });

        });

    },

    question: function (req, res) {

        var question_identifier = req.params.question_identifier;

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            model.ModelContainer.QuestionModel.findOne({
                question_identifier: question_identifier,
                is_deleted: false
            }, function (err, q) {

                if (!q) {
                    res.redirect('/404');
                }
                else {

                    q.views_count++;
                    q.save();

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    res.render('question', {
                        question: q,
                        layout: 'release',
                        user: user,
                        gravatar_url: gravatar_url
                    });
                }

            });
        });

    },

    addVote: function (req, res) {

        var question_id = req.body.question_id;
        var vote_value = req.body.vote_value;
        var fingerprints = req.body.fingerprints;

        var vote = {
            question: question_id,
            vote_value: vote_value,
            fingerprints: fingerprints
        };

        model.ModelContainer.VoteModel.findOne({
            fingerprints: fingerprints,
            question_id: question_id
        }, function (err, voteVerif) {

            if (voteVerif) {
                res.json({message: 'already voted'});
            }
            else {

                model.ModelContainer.QuestionModel.findOne(function (err, q) {
                    model.ModelContainer.VoteModel(vote).save(function (err, v) {

                        if (vote_value == 'yes') {
                            q.vote_yes_count++;
                        }
                        else if (vote_value == 'no') {
                            q.vote_no_count++;
                        }

                        q.save(function (err, qSaved) {

                            res.json({
                                message: 'success',
                                question: qSaved
                            });

                        });

                    });
                });

            }

        });

    }

};