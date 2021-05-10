const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

router.post("/register/",userController.register);

router.post("/login/",userController.login);

router.get("/me",isAuth,userController.getMe);

router.put("/:id",isAuth,userController.updateUser);

module.exports = router;