const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo');
const isAuth = require('../middleware/is-auth');

router.post("/new/",isAuth,todoController.addTodo);

router.get("/todos/",isAuth,todoController.getTodos);

router.get("/:id",isAuth,todoController.getTodo);

router.patch("/:id",isAuth,todoController.updateTodo);

router.delete("/:id",isAuth,todoController.deleteTodo);

module.exports = router;




