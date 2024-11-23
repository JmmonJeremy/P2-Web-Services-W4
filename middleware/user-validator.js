const validator = require('../helpers/validation-methods');

// Sources: https://github.com/mikeerickson/validatorjs & https://blog.logrocket.com/handle-data-validation-node-js-validatorjs/
const acceptUserInput = (req, res, next) => {
  const userValidationRules = {
    googleId: 'string',
    githubId: 'string',    
    email: 'required|string|email',
    password: 'string',
    displayName: 'string',
    firstName: 'string',
    lastName: 'string',
    image: 'string',
    bio: 'string',
    location: 'string',
    company: 'string',
    website: 'string'
  };
  validator(req.body, userValidationRules, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

const approveId = (req, res, next) => {
  const rules = {
    _id: 'required|alpha_num'
  };
  // Apply validation to req.params which holds URL parameters
  validator({ _id: req.params.id }, rules, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        success: false,
        message: 'Validation failed',
        data: err
      });
    } else {
      next();
    }
  });
};

module.exports = {
  acceptUserInput,
  approveId
};