var loadPage = 2;
var stop_load_notification = false;

$('document').ready(function() {

    if($('#notifications-container').length > 0) {

        $(window).scroll(function(){
            if  ($(window).scrollTop() == $(document).height() - $(window).height()){

                if(!stop_load_notification) {
                    loadNextNotificationsPage(loadPage);
                }
            }
        });

    }
});

function loadNextNotificationsPage(page) {

    var user_id = $('#user_id').val();

    $('#notifications-loader').show();

    $.get('/api/notifications/user/' + user_id + '/' + page, function(data) {

        if(data.length === 0) {
            $('#notifications-loader').hide();
            stop_load_questions = true;
        }
        else {

            $('#notifications-loader').hide();
            $('#notifications-container').append(notificationToHtml(data));

            loadPage++;
        }

    });
}

function notificationToHtml(data) {

    var html = '';

    data.forEach(function(nItem) {

        html += notificationItemToHtml(nItem);
    });

    return html;
}

function notificationItemToHtml(nItem) {

    var icon = '';

    if(nItem.type == 'question-first-vote') {
        icon = '<i class="icon-li fa fa-trophy text-danger"></i>';
    }
    if(nItem.type == 'question-first-vote') {
        icon = '<i class="icon-li fa fa-star text-danger"></i>';
    }

    var html = '<li>' + icon + ' ' + moment(nItem.created_at).fromNow() + ' - <a href="' + nItem.url + '">' + nItem.content + '</a></li>';

    return html;
}