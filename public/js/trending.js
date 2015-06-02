var loadPage = 2;
var stop_load_questions_trending = false;

$('document').ready(function() {

    if($('#questions-trending-container').length > 0) {

        $(window).scroll(function(){
            if  ($(window).scrollTop() == $(document).height() - $(window).height()){

                console.log('Scrolled to waypoint!');

                if(!stop_load_questions_trending) {
                    loadNextQuestionsTrendingPage(loadPage);
                }
            }
        });

    }
});

function loadNextQuestionsTrendingPage(page) {

    console.log(page);

    var user_id = $('#user_id').val();

    $('#questions-trending-loader').show();

    $.get('/api/questions/trending/' + page, function(data) {

        console.log(data);

        if(data.length === 0) {
            $('#questions-trending-loader').hide();
            stop_load_questions = true;
        }
        else {

            $('#questions-trending-loader').hide();
            $('#questions-trending-container').append(questionTrendingToHtml(data));

            loadPage++;
        }

    });
}

function questionTrendingToHtml(data) {

    var html = '';

    data.forEach(function(qItem) {
        html += questionTrendingItemToHtml(qItem);
    });

    return html;
}

function questionTrendingItemToHtml(qItem) {

    var html = '<div class="trending-item-container"><p><a href="/u/' + qItem.user.username + '"><img src="' + qItem.user.gravatar_url + '"> ' + qItem.user.username + '</a> ' + moment(qItem.created_at).fromNow() + '</p> <h2><a href="/q/' + qItem.question_identifier + '">' + qItem.question_title + '</a></h2><p>' + qItem.vote_yes_count + ' said <strong>yes</strong>, ' + qItem.vote_no_count + ' said <strong>no</strong>.</p></div>';

    return html;
}