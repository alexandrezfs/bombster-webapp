var model = require('./model');
var config = require('./config');
var slug = require('slug');
var url = require('./url');

exports.getUserNotificationsAndCount = function(user, callback) {

    if(!user) {
        callback({
            notifications: null,
            noread_notifications_count: null
        });
    }
    else {
        model.ModelContainer.NotificationModel.find({user: user._id})
            .sort({created_at: -1})
            .limit(100)
            .exec(function (err, notifications) {

                model.ModelContainer.NotificationModel.count({user: user._id, read: false})
                    .exec(function (err, noread_notifications_count) {

                        callback({
                            notifications: notifications,
                            noread_notifications_count: noread_notifications_count
                        });

                    });
            });
    }

};