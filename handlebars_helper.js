var moment = require('moment');

exports.dateAgo = function(date) {
    return moment(date).fromNow();
};

exports.if_eq = function(a, b, opts) {
    if(a == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
};