const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message,400);
};

const sendErrorProd = (err, res) => {
  console.log(err);
  if (err.isOperational) {     
    res.status(err.statusCode).json({ status: err.statusCode, message: err.message });
  } else {
    console.error("ERROR", err);
    res.status(500).json({
      status: 500,
      message: "Something went wrong",
    });
  }
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
