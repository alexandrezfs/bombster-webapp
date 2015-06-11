var loadPage = 2;
var stop_load_questions = false;
var question_to_delete_id;

$('document').ready(function() {

    if($('#questions-container').length > 0) {

        $(window).scroll(function(){
            if  ($(window).scrollTop() == $(document).height() - $(window).height()){

                if(!stop_load_questions) {
                    loadNextQuestionsPage(loadPage);
                }
            }
        });

    }
});

function loadNextQuestionsPage(page) {

    var user_id = $('#user_id').val();

    $('#questions-loader').show();

    $.get('/api/questions/user/' + user_id + '/' + page, function(data) {

        if(data.length === 0) {
            $('#questions-loader').hide();
            stop_load_questions = true;
        }
        else {

            $('#questions-loader').hide();
            $('#questions-table').append(questionToHtml(data));

            loadPage++;
        }

    });
}

function questionToHtml(data) {

    var html = '';

    data.forEach(function(qItem) {

        html += questionItemToHtml(qItem);
    });

    return html;
}

function questionItemToHtml(qItem) {

    var col1Content = '';

    if(qItem.image.length > 0) {
        col1Content = '<img src="' + qItem.image + '" width="125" alt="Gallery Image" />';
    }
    else {
        col1Content = '<img src="http://placehold.it/200x100&text=Bombster.io" width="125" alt="Gallery Image" />';
    }

    var col2Content = '<p>' + qItem.question_title + '</p>';
    var col3Content = moment(qItem.created_at).fromNow();
    var col4Content = '<span><strong class="semibold"><i class="fa fa-eye"></i> </strong> ' + qItem.views_count + '</span> <span><strong class="semibold"><i class="fa fa-smile-o"></i> </strong> ' + qItem.vote_yes_count + '</span> <span><strong class="semibold"><i class="fa fa-frown-o"></i> </strong> ' + qItem.vote_no_count + '</span>';
    var col5Content = '<a href="/q/' + qItem.question_identifier + '" class="btn btn-xs btn-danger"><i class="fa fa-eye"></i></a> <a class="btn btn-xs btn-secondary"><i class="fa fa-times"></i></a>';

    var html = '<tr><td class="valign-middle">' + col1Content + '</td><td class="valign-middle">' + col2Content + '</td><td style="min-width:100px" class="valign-middle">' + col3Content + '</td><td style="min-width:100px" class="file-info valign-middle">' + col4Content + '</td><td style="min-width:100px" class="text-center valign-middle">' + col5Content + '</td></tr>';

    return html;
}

function openModalDeleteQuestion(question_id) {

    question_to_delete_id = question_id;

    $("#deleteQuestionModal").modal();
}

function deleteQuestion() {

    $.get('/api/question/delete/' + question_to_delete_id, function(data) {

        document.location.href = "";
    });
}