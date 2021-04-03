const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

exports.register = async (req, res, next) => {
    console.log(req.body.user);
  const reqUser = JSON.parse(req.body.user);
  let imageUrl = "";
  if (req.file) {
    imageUrl = req.file.path;
  }
  try {
    const user = await User.findOne({ email: reqUser.email });
    if (user) {
      const err = new Error("Email already exists");
      err.statusCode = 409;
      return next(err);
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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
