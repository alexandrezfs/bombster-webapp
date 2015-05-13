var imgForUpload = null;
var loadPage = 2;
var stop_load_timeline = false;

$('document').ready(function() {

    if($('#timeline-container').length > 0) {

        $(window).scroll(function(){
            if  ($(window).scrollTop() == $(document).height() - $(window).height()){

                console.log('Scrolled to waypoint!');

                if(!stop_load_timeline) {
                    loadNextPage(loadPage);
                }
            }
        });

    }

    if($('#question_submit').length > 0) {

        $('#question_submit').click(function() {

            var question_title = $('#question_title').val();

            if(question_title.length > 0) {

                $.post('/question/add', {
                    question_title: question_title,
                    image: imgForUpload
                }, function(response) {
                    $('#question_title').val('');
                    deleteImage();
                    $('#timeline-container').prepend(timelineItemToHtml(response));
                });
            }

        });
    }

    if($("#questionImageDropzone").length > 0) {
        initDropzone();
    }
});

function loadNextPage(page) {

    console.log(page);

    var user_id = $('#user_id').val();

    $('#timeline-loader').show();

    $.get('/api/timeline/user/' + user_id + '/' + page, function(data) {

        console.log(data);

        if(data.length === 0) {
            $('#timeline-loader').hide();
            stop_load_timeline = true;
        }
        else {

            $('#timeline-loader').hide();
            $('#timeline-container').append(timelineToHtml(data));

            loadPage++;
        }

    });
}

function timelineToHtml(data) {

    var html = '';

    data.forEach(function(tItem) {

        html += timelineItemToHtml(tItem);
    });

    return html;
}

function timelineItemToHtml(tItem) {

    var html = '<div class="feed-item feed-item-question"> <div class="feed-icon bg-secondary"> <i class="fa fa-question"></i> </div><div class="feed-subject"> <p><a href="/u/' + tItem.user.username + '">' + tItem.user.username + '</a> posted <a href="' + tItem.url + '">a new question.</a></p></div><div class="feed-content"> <ul class="icons-list"> <li> <i class="icon-li fa fa-quote-left"></i>' + tItem.content + '</li></ul> </div><div class="feed-actions"> <a href="#" class="pull-left"><i class="fa fa-smile-o"></i> ' + tItem.question.vote_yes_count + '</a> <a href="#" class="pull-left"><i class="fa fa-frown-o"></i> ' + tItem.question.vote_no_count + '</a> <a href="#" class="pull-right"><i class="fa fa-clock-o"></i> ' + moment(tItem.created_at).fromNow() + '</a> </div></div>';

    return html;
}

function initDropzone() {

    var questionImageDropzone = new Dropzone("#questionImageDropzone", { url: "/upload"});

    Dropzone.options.myDropzone = {
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 5, // MB
        acceptedFiles: "image/*",
        previewTemplate : '<div style="display:none"></div>'
    };

    questionImageDropzone.on('sending', function() {

        $('#questionImageDropzone').tooltip('hide');
        $('#img-upload-container').html('<img src="/img/loader.gif" class="loader">');

    });

    questionImageDropzone.on('success', function(file, response) {

        $('#img-upload-container').html('<a href="#" class="fa fa-trash-o ui-tooltip" title="Remove image" onclick="deleteImage(); return false;"><i></i></a><img src="' + response.Location + '" class="img-thumbnail">');

        imgForUpload = response.Location;

        console.log(response);

    });
}

function deleteImage() {

    imgForUpload = null;

    $('#img-upload-container').html('<a href="#" id="questionImageDropzone" class="fa fa-picture-o ui-tooltip" title="Post an Image"><i></i></a>');

    initDropzone();

}