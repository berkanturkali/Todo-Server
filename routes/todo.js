const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo');
const isAuth = require('../middleware/is-auth');

router.post("/new/",isAuth,todoController.addTodo);

module.exports = router;




