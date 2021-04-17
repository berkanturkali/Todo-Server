const Todo = require("../models/todo");
const User = require("../models/user");


exports.addTodo = async (req, res, next) => {
  const { title, category, date, todo, important } = req.body;
  const newTodo = new Todo({
    title,
    category,
    date,
    todo,
    user: req.userId,
    important,
  });
  try {
    const user = await User.findById(req.userId);
    if(!user){
      const err = new Error("User couldn't found");
      err.statusCode = 404;
      return next(err);
    }
    await user.todos.push(newTodo);
    await user.save();
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
  let { filter, category } = req.query;
  const currentPage = req.query.page || 1;
  const perPage = parseInt(req.query.limit);
  let totalItems;
  let filters = [];
  let categoryQuery = {};
  if (category != "all") {
    categoryQuery["category"] =
      category.charAt(0).toUpperCase() + category.slice(1);
  } else {
    categoryQuery = {};
  }
  switch (filter) {
    case "important":
      filters.push({ important: true, ...categoryQuery });
      break;
    case "active":
      filters.push({ completed: false, ...categoryQuery });
      break;
    case "completed":
      filters.push({ completed: true, ...categoryQuery });
      break;
    default:
      filters.push({ ...categoryQuery });
      break;
  }
  try {
    const count = await Todo.find().countDocuments();
    totalItems = count;
    const todos = await Todo.find(filters[0])
      .where("user")
      .equals(req.userId.toString())
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .select("-user")
      .sort("-date");
      if(!todos){
        const err = new Error("Could not found any todo");
        err.statusCode = 404;
        return next(err);
      }
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
