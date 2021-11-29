const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const isAuth = require("../middleware/is-auth");

router.post("/signup/",authController.signup);

router.post("/login/",authController.login);

module.exports = router;