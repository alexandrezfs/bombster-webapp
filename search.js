var model = require('./model');
var notifications = require('./notifications');

exports.searchForQuestion = function (keyword, callback) {

    model.ModelContainer.QuestionModel
        .find(
        {$text: {$search: keyword}},
        {score: {$meta: "textScore"}})
        .sort({score: {$meta: 'textScore'}})
        .populate('user')
        .exec(function (err, results) {
            console.log(results);
            callback(results);
        });

};