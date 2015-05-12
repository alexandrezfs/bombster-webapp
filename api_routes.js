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

module.exports = {

    getQuestion: function (req, res) {

        var _id = req.params._id;

        model.ModelContainer.QuestionModel.findOne({_id: _id}, function(err, question) {

            res.json(question);

        });
    }

};