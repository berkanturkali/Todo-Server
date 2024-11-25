const ErrorResponse = require("../models/error_response");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorResponse(message,400);
};

const sendErrorProd = (err, res) => {
  console.log(err);  
  const error = new ErrorResponse();

  error.message = err.message;
    res.status(err.statusCode).json(error.toJson());
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message;    
  let error = Object.assign(err);  
  if (error.name === 'CastError'){    
    error = handleCastErrorDB(error);
  } 
  sendErrorProd(error, res);
};
