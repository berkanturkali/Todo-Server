const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo");
const isAuth = require("../middleware/is-auth");

router.get("/stats",isAuth,todoController.getStats);

router.get("/allStats",isAuth,todoController.getAllStats);

router.post("/new", isAuth, todoController.addTodo);

router.get("/todos", isAuth, todoController.getTodos);

router.get("/:id", isAuth, todoController.getTodo);

router.patch("/:id", isAuth, todoController.updateTodo);

router.put("/:id/:completed",isAuth,todoController.updateCompleteField);

router.delete(
    "/delete-completed-todos",
    isAuth,
    todoController.deleteCompletedTodos
  );

router.delete("/:id", isAuth, todoController.deleteTodo);
module.exports = router;
