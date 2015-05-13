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

                        //find user and increment vote counts
                        model.ModelContainer.UserModel.findOne({_id: vote.user}, function(err, u) {

                            //Notify if it's the first vote.
                            if(q.vote_yes_count === 1 || q.vote_no_count === 1) {

                                var notification = {
                                    user: u._id,
                                    type: "question-first-vote",
                                    title: "Your question got a first vote !",
                                    content: "Congrats ! Your question \"" + q.question_title + "\" got a first vote. Share it to your friends and get more votes !",
                                    url: "/q/" + q.question_identifier
                                };

                                model.ModelContainer.NotificationModel(notification).save();
                            }

                            if (vote.vote_value == 'yes') {
                                u.vote_yes_count++;
                            }
                            else if (vote.vote_value == 'no') {
                                u.vote_no_count++;
                            }

                            u.save();

                            callback(qSaved);

                        });

                    });

                });
            });

        }

    });

};