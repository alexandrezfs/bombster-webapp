var moment = require('moment');
var gravatar = require('gravatar');

exports.dateAgo = function(date) {
    return moment(date).fromNow();
};

exports.if_eq = function(a, b, opts) {
    if(a == b) {
        return opts.fn(this);
    }
    else {
        return opts.inverse(this);
    }
};

exports.if_no_eq = function(a, b, opts) {
    if(a != b) {
        return opts.fn(this);
    }
    else {
        return opts.inverse(this);
    }
};

exports.gravatar_url_small = function(email) {

    var gravatar_url = gravatar.url(email, {s: '25'});

    return gravatar_url;
};