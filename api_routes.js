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
var vote_utils = require('./vote');
var url = require('./url');
var mongoosePaginate = require('mongoose-paginate');

module.exports = {

    getQuestion: function (req, res) {

        var _id = req.params._id;

        model.ModelContainer.QuestionModel.findOne({_id: _id}, function (err, question) {

            res.json(question);

        });
    },

    getPaginatedTimeline: function (req, res) {

        var page = req.params.page;
        var user_id = req.params.user_id;

        model.ModelContainer.TimelineModel.paginate({user: user_id}, page, 10, function (error, pageCount, paginatedResults, itemCount) {
            if (error) {
                console.error(error);
                res.json(error);
            } else {
                console.log('Pages:', pageCount);
                console.log(paginatedResults);

                res.json(paginatedResults);
            }
        }, {populate: ['question', 'user'], sortBy: {created_at: -1}});

    }

};