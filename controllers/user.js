const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');


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
