// Require our dependencies
var express = require('express'),
    handlebars = require('handlebars'),
    http = require('http'),
    config = require('./config'),
    moment = require('moment'),
    gravatar = require('gravatar'),
    model = require('./model'),
    notifications = require('./notifications');

exports.routeFailed = function (req, res, next) {
    if (res.status != 200) {

        var username = req.session.username;

        model.ModelContainer.UserModel.findOne({username: username, is_deleted: false}, function (err, user) {

            var email = null;
            if (user) {
                email = user.email;
            }

            notifications.getUserNotificationsAndCount(user, function (response) {

                var gravatar_url = gravatar.url(email, {s: '400'});

                res.render('404', {
                    layout: 'admin', gravatar_url: gravatar_url, user: user,
                    notifications: response.notifications,
                    noread_notifications_count: response.noread_notifications_count
                });

            });
        });

    }
};