var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * MONGOOSE DRIVER CONNECTION
 */
mongoose.connect(config.values.mongodb_addr, function (err) {
    if (err) {
        throw err;
    }
    console.log("connected to mongoDB");
});

var UserSchema = new Schema({
    email: String,
    username: String,
    password: String,
    signed_up_with: String,
    signed_up_from: String,
    is_account_activated: Boolean,
    token: String,
    last_login: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var QuestionSchema = new Schema({
    question_title: String,
    question_slug: String,
    question_identifier: String,
    user_id: ObjectId,
    vote_yes_count: Number,
    vote_no_count: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

exports.ModelContainer = {
    UserModel: mongoose.model('User', UserSchema),
    QuestionModel: mongoose.model('Question', QuestionSchema)
};