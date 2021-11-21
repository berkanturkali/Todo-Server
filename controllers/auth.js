const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const catchAsync = require('../utils/catchAsync');
const User = require("../models/user");
const AppError = require("../utils/appError");

exports.signup = catchAsync(async (req, res, next) => {
    const reqUser = JSON.parse(req.body.user);
      const user = await User.findOne({ email: reqUser.email });
      if (user) {    
        return next(new AppError("Email already exists.Please try another one",409));
      }
      const hashedPw = await bcrypt.hash(reqUser.password, 12);
      const newUser = new User({
        firstName: reqUser.firstName,
        lastName: reqUser.lastName,
        email: reqUser.email,
        password: hashedPw,
      });
      await newUser.save();
      res.status(201).send("Successfully signed up");
  
  });

  exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {     
        return next(new AppError("User is not found",404));
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {    
        return next(new AppError("Email or password is not correct",402));
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
        id:user._id
      }
      res.status(200).json(tokenResponse);    
  });