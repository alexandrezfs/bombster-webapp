var linkify = require('linkifyjs');
var linkifyStr = require('linkifyjs/string');

function linkifyYouTubeURLs(text) {
    var re = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
    return text.replace(re, '<br><div><iframe width="440" height="315" src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div><br>');
}

exports.linkifyText = function (text) {

    text = linkifyYouTubeURLs(text);
    //text = linkifyStr(text);

    return text;
};