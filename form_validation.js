var validator = require("email-validator");
var model = require('./model');

exports.FormValidator = {

    validateSignupForm: function (formValues, callback) {

        var errors = [];

        if (formValues.username.length === 0) {
            errors.push('Username is missing.');
        }

        if (formValues.username.length > 70) {
            errors.push('Username must not exceed 70 characters.');
        }

        if (!validator.validate(formValues.email)) {
            errors.push('Your email address is wrong.');
        }

        if (formValues.password.length === 0) {
            errors.push('Password is missing');
        }

        if (formValues.password.length > 70) {
            errors.push('Password must not exceed 70 characters.');
        }

        model.ModelContainer.UserModel.findOne({$or : [{username: formValues.username}, {email: formValues.email}]}, function(err, user) {

            if(user) {
                if(user.email == formValues.email) {
                    errors.push('This email is already registered.');
                }
                else if(user.username == formValues.username) {
                    errors.push('This username is already taken. Please choose another one.');
                }
            }

            callback(errors);

        });

    },

    validateResetPasswordForm: function(formValues, callback) {

        var errors = [];

        if (formValues.password.length === 0) {
            errors.push('Password is missing');
        }

        if (formValues.password.length > 70) {
            errors.push('Password must not exceed 70 characters.');
        }

        if(formValues.password != formValues.passwordC) {
            errors.push('Passwords mismatch !');
        }

        callback(errors);

    }

};