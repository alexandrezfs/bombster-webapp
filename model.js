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
    is_deleted: {type: Boolean, default: false},
    last_login: {type: Date, default: Date.now},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var QuestionSchema = new Schema({
    question_title: String,
    question_slug: String,
    question_identifier: String,
    user_id: ObjectId,
    vote_yes_count: {type: Number, default: 0},
    vote_no_count: {type: Number, default: 0},
    views_count: {type: Number, default: 0},
    reshare_count: {type: Number, default: 0},
    is_vote_opened: {type: Boolean, default: true},
    is_deleted: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

var VoteSchema = new Schema({
    question_id: ObjectId,
    vote_value: String,
    fingerprints: String,
    user_id: ObjectId
});

var TimelineSchema = new Schema({
    user_id: ObjectId,
    type: String,
    object_name: String,
    object_id: ObjectId
});

var NotificationSchema = new Schema({
    user_id: ObjectId,
    type: String,
    read: {type: Boolean, default: false},
    object_name: String,
    object_id: ObjectId
});

exports.ModelContainer = {
    UserModel: mongoose.model('User', UserSchema),
    QuestionModel: mongoose.model('Question', QuestionSchema),
    VoteModel: mongoose.model('Vote', VoteSchema),
    TimelineModel: mongoose.model('Timeline', TimelineSchema),
    NotificationModel: mongoose.model('Notification', NotificationSchema)
};