$(document).ready(function () {

    setInterval(function() {
        reloadVoteData();
    }, 20000);

    var question_id = $('#question_id').val();
    var fingerprints = new Fingerprint().get();

    if ($("#yes").length > 0 && $("#no").length > 0) {

        $("#yes").click(function () {

            console.log({
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'yes'
            });

            $.post('/api/vote', {
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'yes'
            }, function (response) {

                console.log(response);
                displayResult(response);
            });

        });

        $("#no").click(function () {

            $.post('/api/vote', {
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'no'
            }, function (response) {

                console.log(response);
                displayResult(response);
            });

        });

    }

});

function voteSuccess() {

    $('#vote-success').removeClass('hidden');

}

function voteError() {

    $('#vote-error').removeClass('hidden');

}

function displayResult(response) {

    if(response.message && response.message == 'already voted') {
        voteError();
    }
    else {
        voteSuccess();
        assignVoteCounts(response);
    }
}

function reloadVoteData() {

    var question_id = $('#question_id').val();

    $.get('/api/question/' + question_id, function(response) {

        console.log(response);

        assignVoteCounts(response);
    });
}

function assignVoteCounts(response) {
    $('#yes-count').text(response.vote_yes_count);
    $('#no-count').text(response.vote_no_count);
}