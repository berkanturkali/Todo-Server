const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const i18n = require("../utils/localization");
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw new AppError(i18n.__("authentication_required_please_login_continue"),401);
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken =  jwt.verify(token, 'todoSuperSecret');
  } catch (err) {
    throw new AppError(i18n.__("the_token_could_not_be_verified_please_try_to_login_again"),401);
  }
  if (!decodedToken) {
    throw new AppError(i18n.__("authentication_required_please_login_continue"),401);
  }
  req.userId = decodedToken.userId;
  next();
};