$(document).ready(function () {

    var question_id = $('#question_id').val();
    var fingerprints = new Fingerprint().get();

    if ($("#yes").length > 0 && $("#no").length > 0) {

        $("#yes").click(function () {

            console.log({
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'yes'
            });

            $.post('/vote', {
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'yes'
            }, function (response) {

                console.log(response);
                displayResult(response);
            });

        });

        $("#no").click(function () {

            $.post('/vote', {
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
    }

}