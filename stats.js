var model = require('./model');
var moment = require('moment');
var config = require('./config');
var email_interface = require('./email_interface');

var getVoteCountOfUserThisWeek = function (vote_value, user, callback) {

    //find user questions
    model.ModelContainer.QuestionModel.find({user: user._id, is_deleted: false}, function (err, questions) {

        var question_ids = [];

        questions.forEach(function (question) {
            question_ids.push(question._id);
        });

        model.ModelContainer.VoteModel.find({
            question: {$in: question_ids},
            vote_value: vote_value,
            created_at: {$gte: moment().subtract(7, 'days').toDate()}
        })
            .exec(function (err, data) {
                callback(data.length);
            });

    });
};

var getVoteCountOfUserLastWeek = function (vote_value, user, callback) {

    //find user questions
    model.ModelContainer.QuestionModel.find({user: user._id, is_deleted: false}, function (err, questions) {

        var question_ids = [];

        questions.forEach(function (question) {

            question_ids.push(question._id);
        });

        model.ModelContainer.VoteModel.find({
            question: {$in: question_ids},
            vote_value: vote_value,
            created_at: {
                $gte: moment().subtract(14, 'days').toDate(),
                $lte: moment().subtract(7, 'days').toDate()
            }
        })
            .exec(function (err, data) {
                callback(data.length);
            });

    });

};

var getBestQuestion = function(user, callback) {

    model.ModelContainer.QuestionModel
        .findOne({user: user._id})
        .sort({views_count: -1})
        .exec(function(err, question) {
       callback(question);
    });

};

var getWeeklyStats = function (user, callback) {

    var stats = {};

    getVoteCountOfUserThisWeek('yes', user, function (yesThisWeek) {

        getVoteCountOfUserThisWeek('no', user, function (noThisWeek) {

            getVoteCountOfUserLastWeek('yes', user, function (yesLastWeek) {

                getVoteCountOfUserLastWeek('no', user, function (noLastWeek) {

                    getBestQuestion(user, function(bestQuestion) {

                        stats = {
                            yesThisWeek: yesThisWeek,
                            noThisWeek: noThisWeek,
                            yesLastWeek: yesLastWeek,
                            noLastWeek: noLastWeek,
                            noDiff: noThisWeek - noLastWeek,
                            yesDiff: yesThisWeek - yesLastWeek
                        };

                        callback(stats);

                    });

                });

            });

        });

    });

};

exports.sendWeeklyStats = function () {

    model.ModelContainer.UserModel.find({is_deleted: false, send_system_notifications: true}, function (err, users) {

        users.forEach(function (user) {

            getWeeklyStats(user, function (stats) {

                //Send a mail
                email_interface.sendMailWithTemplate(
                    "",
                    "",
                    config.values.mandrill_templates['bombster-weekly-stats'].name,
                    config.values.email_system_address,
                    "Bombster.io",
                    user.email,
                    config.values.mandrill_templates['bombster-weekly-stats'].slug,
                    [
                        {name: "USERNAME", content: user.username},
                        {name: "YES_VOTE_THIS_WEEK", content: stats.yesThisWeek},
                        {name: "NO_VOTE_THIS_WEEK", content: stats.noThisWeek},
                        {name: "YES_VOTE_LAST_WEEK", content: stats.yesLastWeek},
                        {name: "NO_VOTE_LAST_WEEK", content: stats.noLastWeek},
                        {name: "YES_DIFF", content: stats.yesDiff},
                        {name: "NO_DIFF", content: stats.noDiff}
                    ],
                    function (response) {
                        console.log(response);
                        console.log(stats);
                    });

            });

        });

    });

};