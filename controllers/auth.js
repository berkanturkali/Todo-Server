const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const catchAsync = require('../utils/catchAsync');
const User = require("../models/user");
const AppError = require("../utils/appError");

const SuccessResponse = require("../models/success_response");
const ErrorResponse = require("../models/error_response");

const i18n = require('../utils/localization');

exports.signup = catchAsync(async (req, res, next) => {
    const reqUser = req.body;
        
      const user = await User.findOne({ email: reqUser.email });
      if (user) {    
        return next(new AppError(i18n.__("email_already_exists_please_try_another_one"),409));
      }
      const hashedPw = await bcrypt.hash(reqUser.password, 12);
      const newUser = new User({
        firstName: reqUser.firstName,
        lastName: reqUser.lastName,
        email: reqUser.email,
        password: hashedPw,
      });
      await newUser.save();
      let response = new SuccessResponse(i18n.__("signup_successful_welcome")).toJson();
      
      res.status(201).json(response);
  
  });

  exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {     
        return next(new ErrorResponse(i18n.__("user_not_found_please_check_your_credentials_and_try_again"),404));
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {    
        return next(new ErrorResponse(i18n.__("invalid_email_or_password_please_try_again"), 402));
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        "todoSuperSecret",
        {
          expiresIn: "90d",
        }
      ); 
      const tokenResponse = {
        token: token,
        id: user._id
      }

      let response = new SuccessResponse();

      response.data = tokenResponse;


      console.log(response.toJson());
      
      
      res.status(200).json(response.toJson());    
  });