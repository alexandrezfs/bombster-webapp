var model = require('./model');

exports.vote = function (vote, userVote, callback) {

    var findOneQuery = {question: vote.question};

    console.log(userVote);

    if(userVote && userVote !== null) {
        findOneQuery.$or = [{user: userVote._id}, {fingerprints: vote.fingerprints}];
    }
    else {
        findOneQuery.fingerprints = vote.fingerprints;
    }

    model.ModelContainer.VoteModel.findOne(findOneQuery, function (err, voteVerif) {

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

                            //find user of this question and increment vote counts
                            model.ModelContainer.UserModel.findOne({_id: q.user}, function (err, uQuestion) {

                                //Notify if it's the first vote.
                                if (q.vote_yes_count === 1 || q.vote_no_count === 1) {

                                    var notification = {
                                        user: uQuestion._id,
                                        type: "question-first-vote",
                                        title: "Your question got a first vote !",
                                        content: "Congrats ! Your question \"" + q.question_title + "\" got a first vote. Share it to your friends and get more votes !",
                                        url: "/q/" + q.question_identifier
                                    };

                                    model.ModelContainer.NotificationModel(notification).save();
                                }

                                if(userVote && userVote !== null) {

                                    if (vote.vote_value == 'yes') {
                                        userVote.vote_yes_count++;
                                    }
                                    else if (vote.vote_value == 'no') {
                                        userVote.vote_no_count++;
                                    }

                                    userVote.save();
                                }

                                callback(qSaved);

                            });

                        });

                    });
                });

            }

        }
    );

};