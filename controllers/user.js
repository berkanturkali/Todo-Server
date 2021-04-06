const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
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

exports.login = async (req, res, next) => {
  const { email, password } = req.body;  
  let mUser;
  try {
    const user =await User.findOne({email});
    if (!user) {
      const err = new Error("User is not found");
      err.statusCode = 404;
      return next(err);
    }
    mUser = user;    
    const isEqual = await bcrypt.compare(password, mUser.password);
    if (!isEqual) {
      const err = new Error("E-mail or password is not correct");
      err.statusCode = 402;
      return next(err);
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
      userId: mUser._id.toString()
    }

    res.status(200).json(tokenResponse);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async(req,res,next) =>{
  const userId = req.body.id;
  
}
