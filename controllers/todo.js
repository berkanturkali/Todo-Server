const Todo = require("../models/todo");
const user = require("../models/user");
const User = require("../models/user");
const { use } = require("../routes/todo");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.addTodo = catchAsync(async (req, res, next) => {
  const { category, date, todo, important } = req.body;
  const newTodo = new Todo({
    category,
    date,
    todo,
    user: req.userId,
    important,
  });
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError("User could not be found.", 404));
  }
  await user.todos.push(newTodo);
  await user.save();
  await newTodo.save();
  res.status(201).send("Saved todo successfully");
});
exports.getTodos = catchAsync(async (req, res, next) => {
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
  const count = await Todo.find().countDocuments();
  totalItems = count;
  const todos = await Todo.find(filters[0])
    .where("user")
    .equals(req.userId.toString())
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .select("-user")
    .sort("-date");
  res.status(200).json(todos);
});

exports.getTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const todo = await Todo.findById(todoId).select("-user");
  if (!todo) {
    return next(new AppError("Not Found", 404));
  }
  res.status(200).json(todo);
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const { category, date, completed, important, todo } = req.body;
  const mTodo = todo;
  const existsTodo = await Todo.findById(todoId).select("-user");
  if (!existsTodo) {
    return next(new AppError("Not Found", 404));
  }
  existsTodo.category = category;
  existsTodo.date = date;
  existsTodo.todo = mTodo;
  existsTodo.completed = completed;
  existsTodo.important = important;
  await existsTodo.save();
  res.status(200).send("Updated successfully");
});
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const todo = await Todo.findById(todoId).select("-user");
  if (!todo) {
    return next(new AppError("Not found", 404));
  }
  await todo.deleteOne();
  const user = await User.findById(req.userId);
  user.todos.pull(todoId);
  await user.save();

  res.status(204).send();
});

exports.deleteCompletedTodos = catchAsync(async (req, res, next) => {
  const completedTodos = await Todo.findOne({
    user: req.userId,
    completed: true,
  });
  if (!completedTodos) {
    return next(new AppError("Could not found completed todo", 400));
  }
  await Todo.deleteMany({ user: req.userId, completed: true });
  res.status(204).send();
});

exports.getStats = catchAsync(async (req, res, next) => {
  const totalCount = await Todo.countDocuments({ user: req.userId });
  const activeCount = await Todo.countDocuments({
    user: req.userId,
    completed: false,
  });
  const completedCount = totalCount - activeCount;
  const resObject = {
    activeTasksPercent: activeCount,
    completedTasksPercent:completedCount,
    totalCount
  };
  res.status(200).json(resObject);
});
