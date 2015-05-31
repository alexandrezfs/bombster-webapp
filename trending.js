var model = require('./model');

exports.getPopularTrends = function(count, callback) {

    model.ModelContainer.QuestionModel.find({is_deleted: false})
        .sort({views_count: -1})
        .limit(count)
        .populate(['user'])
        .exec(function(err, questions) {

        callback(questions);

    });
};