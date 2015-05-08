$('document').ready(function() {

    console.log('test');

    $('#question_submit').click(function() {

        var question_title = $('#question_title').val();

        if(question_title.length > 0) {

            $.post('/question/add', {question_title: question_title}, function(response) {

                console.log(response);

            });
        }

    });

    var questionImageDropzone = new Dropzone("#questionImageDropzone", { url: "/upload"});

    Dropzone.options.myDropzone = {
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 5, // MB
        acceptedFiles: "image/*",
        previewTemplate : '<div style="display:none"></div>'
    };

    questionImageDropzone.on('success', function(file, response) {

        console.log(response);

    });

});