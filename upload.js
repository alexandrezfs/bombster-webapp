var AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('./config');

exports.upload = function (file, filename, callback) {

    AWS.config.update({
        accessKeyId: config.values.aws.accessKeyId,
        secretAccessKey: config.values.aws.secretAccessKey,
        region: 'ap-northeast-1'
    });

    fs.readFile(file, function (err, data) {

        if (err) {
            throw err;
        }

        var s3bucket = new AWS.S3({params: {Bucket: 'bombster'}});
        s3bucket.createBucket(function() {
            var params = {Key: 'images/' + filename, Body: data};
            s3bucket.upload(params, function(err, data) {
                callback(data);
            });
        });

    });

};