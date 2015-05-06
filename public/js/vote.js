$(document).ready(function () {

    var question_id = $('#question_id').val();
    var fingerprints = new Fingerprint().get();

    console.log(fingerprints);

    if ($("#yes").length > 0 && $("#no").length > 0) {

        $("#yes").click(function () {

            $.post('/vote', {
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'yes'
            }, function (response) {

                console.log(response);
            });

        });

        $("#no").click(function () {

            $.post('/vote', {
                fingerprints: fingerprints,
                question_id: question_id,
                vote_value: 'no'
            }, function (response) {

                console.log(response);
            });

        });

    }

});