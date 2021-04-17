const Todo = require("../models/todo");
const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');

exports.addTodo = catchAsync(async (req, res, next) => {
  const { title, category, date, todo, important } = req.body;
  const newTodo = new Todo({
    title,
    category,
    date,
    todo,
    user: req.userId,
    important,
  });
  const user = await User.findById(req.userId);
  if(!user){
    return next(new AppError("User could not be found.",404));
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
      return next(new AppError("Not Found",404));
    }
    res.status(200).json(todo);
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const { title, category, date, completed, important, todo } = req.body;
  const mTodo = todo; 
    const isExists = await Todo.findById(todoId).select("-user");
    if (!isExists) { 
      return next(new AppError("Not Found",404));
    }
    todo.title = title;
    todo.category = category;
    todo.date = date;
    todo.todo = mTodo;
    todo.completed = completed;
    todo.important = important;
    await todo.save();
    res.status(200).send("Updated successfully");  
});
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
    const todo = await Todo.findById(todoId).select("-user");
    if (!todo) {      
      return next(new AppError("Not found",404));
    }
    await todo.deleteOne();
    res.status(200).send("Deleted successfully"); 
});
