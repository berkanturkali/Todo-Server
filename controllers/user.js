const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  const reqUser = JSON.parse(req.body.user);
  let imageUrl = "";
  if (req.file) {
    imageUrl = req.file.path;
  }
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
      userImage: imageUrl,
    });
    await newUser.save();
    res.status(201).send();

});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  let mUser;
    const user = await User.findOne({ email });
    if (!user) {     
      return next(new AppError("User is not found",404));
    }
    mUser = user;
    const isEqual = await bcrypt.compare(password, mUser.password);
    if (!isEqual) {    
      return next(new AppError("Email or password is not correct",402));
    }
    const token = jwt.sign(
      {
        email: mUser.email,
        userId: mUser._id.toString(),
      },
      "todoSuperSecret",
      {
        expiresIn: "90d",
      }
    );
    const tokenResponse = {
      token,
      userId: mUser._id.toString(),
    };

    res.status(200).json(tokenResponse);
  
});

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.userId).select("-_id -password");
    if (!user) {
      return next(new AppError("User not found",404));
    }    
    return res.status(200).json(user); 
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { firstName, lastName, email } = JSON.parse(req.body.credentials);
  let imageUrl;
  let isOk;
  if (userId != req.userId) {
    return next(new AppError("Not authenticated,please login",401));
  }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return next(new AppError("User not found",404));
    }
    if (user.email == email) {
      isOk = true;
    } else {
      const isExists = await User.findOne({ email });
      if (isExists) {   
        return next(new AppError("Email already exist.Please try another one"));
      }
      isOk = true;
    }
    if (isOk) {
      if (req.file) {
        imageUrl = req.file.path;
        if (user.userImage) {
          clearImage(user.userImage);
        }
      } else {
        imageUrl = user.userImage;
      }
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.userImage = imageUrl;
      await user.save();
      res.status(200).send();
    }  
});

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
