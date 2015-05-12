var model = require('./model');

exports.vote = function(vote, callback) {

    model.ModelContainer.VoteModel.findOne({
        fingerprints: vote.fingerprints,
        question: vote.question
    }, function (err, voteVerif) {

        if (voteVerif) {
            callback({message: 'already voted'});
        }
        else {

            model.ModelContainer.QuestionModel.findOne({_id: vote.question}, function (err, q) {
                model.ModelContainer.VoteModel(vote).save(function (err, v) {

                    if (vote.vote_value == 'yes') {
                        q.vote_yes_count++;
                    }
                    else if (vote.vote_value == 'no') {
                        q.vote_no_count++;
                    }

                    q.save(function (err, qSaved) {

                       callback(qSaved);

                    });

                });
            });

        }

    });

};