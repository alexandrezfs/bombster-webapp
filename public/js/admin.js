var imgForUpload = null;

$('document').ready(function() {

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
                });
            }

        });
    }

    if($("#questionImageDropzone").length > 0) {
        initDropzone();
    }
});

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