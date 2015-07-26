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
var urlTools = require('./url');
var notifications = require('./notifications');
var search = require('./search');
var trending = require('./trending');
var linkManip = require('./linkManip');

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
                        gravatar_url: gravatar.url(formValues.email, {s: '25'}),
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

                        var notification = {
                            user: u._id,
                            type: "signup",
                            title: "Welcome on Bombster !",
                            content: "Congrats ! You successfully signed up. You can start asking questions by now !",
                            url: "/dashboard"
                        };

                        model.ModelContainer.NotificationModel(notification).save(function (err, n) {

                            res.redirect('/dashboard');

                        });
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

            model.ModelContainer.UserModel.findOne({_id: req.cookies._id, is_deleted: false}, function (err, user) {

                if (user) {

                    //Update login date
                    user.last_login = new Date();
                    user.gravatar_url = gravatar.url(user.email, {s: '25'});
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

    logout: function (req, res) {

        req.session.destroy();

        res.redirect('/');
    },

    loginProcess: function (req, res) {

        var login = req.body.login;
        var password = req.body.password;
        var remember = req.body.remember;

        var errors = [];

        model.ModelContainer.UserModel.findOne({
            $or: [{username: login}, {email: login}],
            is_deleted: false
        }, function (err, user) {

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

        model.ModelContainer.UserModel.findOne({email: email, is_deleted: false}, function (err, user) {

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
                    config.values.mandrill_templates['bombster-reset-password'].name,
                    config.values.email_system_address,
                    "Bombster.io",
                    user.email,
                    config.values.mandrill_templates['bombster-reset-password'].slug,
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

        model.ModelContainer.UserModel.findOne({token: token, is_deleted: false}, function (err, user) {

            if (user) {
                res.render('password_reset', {user: user, token: token, layout: 'landing'});
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
                            config.values.mandrill_templates['bombster-reset-password-success'].name,
                            config.values.email_system_address,
                            "Bombster.io",
                            user.email,
                            config.values.mandrill_templates['bombster-reset-password-success'].slug,
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

                    model.ModelContainer.NotificationModel.find({user: user._id})
                        .sort({created_at: -1})
                        .limit(100)
                        .exec(function (err, notifications) {

                            model.ModelContainer.NotificationModel.count({user: user._id, read: false})
                                .exec(function (err, noread_notifications_count) {

                                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                                    trending.getPopularTrends(5, 1, function (trending_questions) {

                                        model.ModelContainer.QuestionModel.count({
                                            user: user._id,
                                            is_deleted: false
                                        })
                                            .exec(function (err, questions_count) {

                                                res.render('dashboard', {
                                                    user: user,
                                                    timelineItems: timelineItems,
                                                    layout: 'admin',
                                                    gravatar_url: gravatar_url,
                                                    notifications: notifications,
                                                    noread_notifications_count: noread_notifications_count,
                                                    trending_questions: trending_questions,
                                                    questions_count: questions_count
                                                });
                                            });

                                    });
                                });

                        });

                });

        });

    },

    user: function (req, res) {

        var username = req.session.username;
        var other_user_username = req.params.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {
            model.ModelContainer.UserModel.findOne({
                username: other_user_username,
                is_deleted: false
            }, function (err, other_user) {

                model.ModelContainer.TimelineModel.find({
                    user: other_user._id,
                    is_deleted: false
                })
                    .sort({created_at: -1})
                    .limit(10)
                    .populate('user')
                    .populate('question')
                    .exec(function (err, timelineItems) {

                        trending.getPopularTrends(5, 1, function (trending_questions) {

                            if (user) {

                                model.ModelContainer.NotificationModel.find({user: user._id})
                                    .sort({created_at: -1})
                                    .limit(100)
                                    .exec(function (err, notifications) {

                                        model.ModelContainer.NotificationModel.count({user: user._id, read: false})
                                            .exec(function (err, noread_notifications_count) {

                                                var gravatar_url = gravatar.url(user.email, {s: '400'});
                                                var other_user_gravatar_url = gravatar.url(other_user.email, {s: '400'});


                                                model.ModelContainer.QuestionModel.count({
                                                    user: other_user._id,
                                                    is_deleted: false
                                                })
                                                    .exec(function (err, questions_count) {

                                                        res.render('user', {
                                                            user: user,
                                                            other_user: other_user,
                                                            timelineItems: timelineItems,
                                                            layout: 'admin',
                                                            gravatar_url: gravatar_url,
                                                            notifications: notifications,
                                                            noread_notifications_count: noread_notifications_count,
                                                            trending_questions: trending_questions,
                                                            other_user_gravatar_url: other_user_gravatar_url,
                                                            questions_count: questions_count
                                                        });

                                                    });

                                            });
                                    });


                            }
                            else {

                                var other_user_gravatar_url = gravatar.url(other_user.email, {s: '400'});

                                model.ModelContainer.QuestionModel.count({
                                    user: other_user._id,
                                    is_deleted: false
                                })
                                    .exec(function (err, questions_count) {

                                        res.render('user', {
                                            other_user: other_user,
                                            timelineItems: timelineItems,
                                            layout: 'admin',
                                            trending_questions: trending_questions,
                                            other_user_gravatar_url: other_user_gravatar_url,
                                            questions_count: questions_count
                                        });
                                    });
                            }
                        });
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

                    t.populate('question')
                        .populate('user', function (err, t) {
                            res.json(t);
                        });

                });

            });

        });

    },

    question: function (req, res) {

        var question_identifier = req.params.question_identifier;
        var fullUrl = urlTools.currentUrl(req);

        model.ModelContainer.QuestionModel.findOne({
            question_identifier: question_identifier,
            is_deleted: false
        }, function (err, q) {

            console.log(q);

            if (!q) {
                res.redirect('/404');
            }
            else {

                q.views_count++;
                q.save();

                var question_title_linkified = linkManip.linkifyText(q.question_title);

                res.render('question', {
                    question: q,
                    question_title_linkified: question_title_linkified,
                    layout: 'release',
                    url: fullUrl
                });
            }

        });

    },

    userQuestions: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            model.ModelContainer.QuestionModel.find({
                user: user._id,
                is_deleted: false
            })
                .sort({created_at: -1})
                .limit(10)
                .populate('user')
                .exec(function (err, questionItems) {

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    notifications.getUserNotificationsAndCount(user, function (response) {

                        res.render('user_questions', {
                            user: user,
                            questionItems: questionItems,
                            layout: 'admin',
                            gravatar_url: gravatar_url,
                            notifications: response.notifications,
                            noread_notifications_count: response.noread_notifications_count
                        });

                    });

                });

        });
    },

    notifications: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            var gravatar_url = gravatar.url(user.email, {s: '400'});

            notifications.getUserNotificationsAndCount(user, function (response) {

                notifications.getNotificationsByPageAndUser(user._id, 1, function (allNotifications) {

                    res.render('dashboard_notifications', {
                        user: user,
                        layout: 'admin',
                        gravatar_url: gravatar_url,
                        notifications: response.notifications,
                        noread_notifications_count: response.noread_notifications_count,
                        allNotifications: allNotifications
                    });

                });

            });
        });
    },

    settings: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            var gravatar_url = gravatar.url(user.email, {s: '400'});

            notifications.getUserNotificationsAndCount(user, function (response) {

                res.render('settings', {
                    user: user,
                    layout: 'admin',
                    gravatar_url: gravatar_url,
                    notifications: response.notifications,
                    noread_notifications_count: response.noread_notifications_count
                });

            });
        });
    },

    passwordUpdate: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            if (user) {

                notifications.getUserNotificationsAndCount(user, function (response) {

                    var formValues = req.body;
                    formValues.user = user;

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    formValidator.FormValidator.validateUpdatePassword(formValues, function (errors) {

                        if (errors.length === 0) {

                            //no error found, update password

                            bcrypt.hash(formValues.password, 10, function (err, hash) {

                                user.password = hash;

                                user.save(function (err, u) {

                                    res.redirect('/dashboard/settings');

                                    //Send a mail
                                    email_interface.sendMailWithTemplate(
                                        "",
                                        "",
                                        config.values.mandrill_templates['bombster-update-password-success'].name,
                                        config.values.email_system_address,
                                        "Bombster.io",
                                        u.email,
                                        config.values.mandrill_templates['bombster-update-password-success'].slug,
                                        [{name: "USERNAME", content: u.username}],
                                        function (response) {
                                            console.log(response);
                                        });

                                });

                            });
                        }
                        else {
                            res.render('settings', {
                                layout: 'admin',
                                errors: errors,
                                gravatar_url: gravatar_url,
                                notifications: response.notifications,
                                user: user
                            });
                        }

                    });


                });
            }

        });

    },

    toggleNotification: function (req, res) {

        var username = req.session.username;

        var send_system_notifications = req.body.send_system_notifications;

        console.log(send_system_notifications);

        var value = send_system_notifications ? true : false;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            user.send_system_notifications = value;
            user.save(function (err, u) {
                res.redirect('/dashboard/settings');
            });

        });
    },

    profileUpdate: function (req, res) {

        var username = req.session.username;

        var formValues = req.body;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            if (user) {

                notifications.getUserNotificationsAndCount(user, function (response) {

                    var formValues = req.body;
                    formValues.user = user;

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    formValidator.FormValidator.validateUpdateProfile(formValues, function (errors) {

                        if (errors.length > 0) {

                            res.render('settings', {
                                layout: 'admin',
                                errors: errors,
                                gravatar_url: gravatar_url,
                                notifications: response.notifications,
                                user: user
                            });

                        }
                        else {
                            user.email = formValues.email;
                            user.save(function (err, u) {
                                res.redirect('/dashboard/settings');
                            });
                        }

                    });

                });
            }
        });

    },

    search: function (req, res) {

        var username = req.session.username;
        var keyword = req.query.keyword;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            search.searchForQuestion(keyword, function (questions) {

                trending.getPopularTrends(5, 1, function (trending_questions) {

                    if (user) {

                        var gravatar_url = gravatar.url(user.email, {s: '400'});

                        notifications.getUserNotificationsAndCount(user, function (response) {

                            res.render('search', {
                                layout: 'admin',
                                gravatar_url: gravatar_url,
                                notifications: response.notifications,
                                user: user,
                                questions: questions,
                                trending_questions: trending_questions
                            });

                        });
                    }
                    else {

                        res.render('search', {
                            layout: 'admin',
                            questions: questions,
                            trending_questions: trending_questions
                        });

                    }

                });

            });

        });
    },

    trending: function (req, res) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            trending.getPopularTrends(5, 1, function (trending_questions) {

                if (user) {

                    var gravatar_url = gravatar.url(user.email, {s: '400'});

                    notifications.getUserNotificationsAndCount(user, function (response) {

                        model.ModelContainer.QuestionModel.count({
                            user: user._id,
                            is_deleted: false
                        })
                            .exec(function (err, questions_count) {
                                res.render('trending', {
                                    layout: 'admin',
                                    gravatar_url: gravatar_url,
                                    notifications: response.notifications,
                                    user: user,
                                    trending_questions: trending_questions,
                                    questions_count: questions_count
                                });
                            });

                    });
                }
                else {

                    res.render('trending', {
                        layout: 'admin',
                        trending_questions: trending_questions
                    });

                }

            });

        });
    },

    deleteAccount: function (req, res) {

        var username = req.session.username;
        var password1 = req.body.password1;
        var password2 = req.body.password2;

        var errors = [];

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            if (password1 == password2) {

                if (user) {

                    bcrypt.compare(password1, user.password, function (err, result) {

                        if (result === true) {

                            user.is_deleted = true;
                            user.save();
                            req.session.destroy();
                            res.redirect('/');
                        }
                        else {
                            var gravatar_url = gravatar.url(user.email, {s: '400'});

                            notifications.getUserNotificationsAndCount(user, function (response) {

                                errors.push('Your password is not correct.');

                                res.render('settings', {
                                    user: user,
                                    layout: 'admin',
                                    gravatar_url: gravatar_url,
                                    notifications: response.notifications,
                                    noread_notifications_count: response.noread_notifications_count,
                                    errors: errors
                                });

                            });
                        }

                    });
                }
            }
            else {

                errors.push('Passwords are not the same.');

                var gravatar_url = gravatar.url(user.email, {s: '400'});

                notifications.getUserNotificationsAndCount(user, function (response) {

                    res.render('settings', {
                        user: user,
                        layout: 'admin',
                        gravatar_url: gravatar_url,
                        notifications: response.notifications,
                        noread_notifications_count: response.noread_notifications_count,
                        errors: errors
                    });

                });
            }

        });

    }

};