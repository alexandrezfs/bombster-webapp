var formValidator = require('./form_validation');

module.exports = {

    index: function (req, res) {

        res.render('index');
    },

    signup: function (req, res) {

        res.render('signup');
    },

    signupProcess: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;
        var username = req.body.username;

        var formValues = {
            email: email,
            password: password,
            username: username
        };

        var errors = formValidator.FormValidator.validateSignupForm(formValues);

        if (errors.length > 0) {
            res.render('signup', {formValues: formValues, errors: errors});
        }
        else {
            res.redirect('/dashboard');
        }

    }

};