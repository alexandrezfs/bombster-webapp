var moment = require('moment');

exports.dateAgo = function(date) {
    return moment(date).fromNow();
};