const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw new AppError('Not authenticated',401);
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken =  jwt.verify(token, 'todoSuperSecret');
  } catch (err) {
    throw new AppError("Could not verify",401);
  }
  if (!decodedToken) {
    throw new AppError('Not authenticated',401);
  }
  req.userId = decodedToken.userId;
  next();
};