const Todo = require("../models/todo");

exports.addTodo = async (req, res, next) => {
  const { title, category, date, todo,important } = req.body;
  const newTodo = new Todo({
    title,
    category,
    date,
    todo,
    user: req.userId,
    important    
  });
  try {
    await newTodo.save();
    res.status(201).send("Saved todo successfully");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getTodos = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = parseInt(req.query.limit);
  let totalItems;
  try {
    const count = await Todo.find().countDocuments();
    totalItems = count;
    const todos = await Todo.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select("-user")
      .sort("-date");

    res.status(200).json(todos);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getTodo = async (req, res, next) => {
  const todoId = req.params.id;
  try {
    const todo = await Todo.findById(todoId).select("-user");
    if (!todo) {
      const err = new Error("No found");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json(todo);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateTodo = async (req, res, next) => {
  const todoId = req.params.id;
  const { title, category, date, completed, important, todo } = req.body;
  const mTodo = todo;
  try {
    const todo = await Todo.findById(todoId).select("-user");
    if (!todo) {
      const err = new Error("No found");
      err.statusCode = 404;
      return next(err);
    }
    todo.title = title;
    todo.category = category;
    todo.date = date;
    todo.todo = mTodo;
    todo.completed = completed;
    todo.important = important;
    await todo.save();
    res.status(200).send("Updated successfully");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.deleteTodo = async (req, res, next) => {
  const todoId = req.params.id;
  try {
    const todo = await Todo.findById(todoId).select("-user");
    if (!todo) {
      const err = new Error("No found");
      err.statusCode = 404;
      return next(err);
    }
    await todo.deleteOne();
    res.status(200).send("Deleted successfully");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
