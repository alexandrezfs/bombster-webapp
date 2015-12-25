var model = require('./model');
var gravatar = require('gravatar');

exports.getPopularTrends = function(count, page, callback) {

    model.ModelContainer.QuestionModel.paginate({is_deleted: false}, {page: page, limit: count}, function (error, pageCount, paginatedResults, itemCount) {
        if (error) {
            console.error(error);
            res.json(error);
        } else {
            console.log('Pages:', pageCount);

            callback(paginatedResults);
        }
    }, {populate: ['user'], sortBy: {views_count: -1}});
};
