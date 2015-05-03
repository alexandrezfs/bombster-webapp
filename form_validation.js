var validator = require("email-validator");

exports.FormValidator = {

    validateSignupForm: function(formValues) {

        var errors = [];

        if(formValues.username.length === 0) {
            errors.push('Username is missing.');
        }

        if(formValues.username.length > 70) {
            errors.push('Username must not exceed 70 characters.');
        }

        if(!validator.validate(formValues.email)) {
            errors.push('Your email address is wrong.');
        }

        if(formValues.password.length === 0) {
            errors.push('Password is missing');
        }

        if(formValues.password.length > 70) {
            errors.push('Username must not exceed 70 characters.');
        }

        return errors;

    }

};