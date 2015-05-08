var Upload = require('s3-uploader');
var config = require('./config');

process.env.AWS_ACCESS_KEY_ID = config.values.aws.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = config.values.aws.secretAccessKey;

exports.client = new Upload('bombster-images', {
    
    awsBucketRegion: 'us-west-2',
    awsBucketPath: 'images/',
    awsBucketAcl: 'public-read',

    versions: [{
        original: true
    },{
        suffix: '-large',
        quality: 80,
        maxHeight: 1040,
        maxWidth: 1040,
    },{
        suffix: '-medium',
        maxHeight: 780,
        maxWidth: 780
    },{
        suffix: '-small',
        maxHeight: 320,
        maxWidth: 320
    }]
});