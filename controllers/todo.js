const Todo = require("../models/todo");
const user = require("../models/user");
const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.addTodo = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { category, date, todo, important, notifyMe, notificationId } =
    req.body;
  const newTodo = new Todo({
    category,
    date,
    todo,
    user: req.userId,
    important,
    notifyMe,
    notificationId,
  });
  await newTodo.save();
  res.status(201).send("Success");
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
    .sort({ date: -1 })
    .equals(req.userId.toString())
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
  console.log(todos);
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

exports.updateCompleteField = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const completed = req.params.completed;
  const todo = await Todo.findByIdAndUpdate(
    todoId,
    { completed: completed },
    () => {
      res.status(200).send("Updated Successfully");
    }
  );
});

exports.updateTodo = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const todoId = req.params.id;
  const updateCompleteField = req.body.updateCompleteField;
  const {
    category,
    date,
    completed,
    important,
    todo,
    notifyMe,
    notificationId,
  } = req.body;
  const todoo = await Todo.findById(todoId).select("-user");
  if (!todoo) {
    return next(new AppError("Not Found", 404));
  }
  if (updateCompleteField) {
    todoo.completed = true;
  } else {
    todoo.category = category;
    todoo.date = date;
    todoo.todo = todo;
    todoo.completed = completed;
    todoo.important = important;
    todoo.notifyMe = notifyMe;
    todoo.notificationId = notificationId;
  }
  await todoo.save();
  res.status(200).send("Updated successfully");
});
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const todoId = req.params.id;
  const todo = await Todo.findById(todoId).select("-user");
  console.log(todo);
  if (!todo) {
    return next(new AppError("Not found", 404));
  }
  await todo.deleteOne();
  res.send(todo.notificationId.toString());
});

exports.deleteCompletedTodos = catchAsync(async (req, res, next) => {
  const completedTodos = await Todo.findOne({
    user: req.userId,
    completed: true,
  });
  if (!completedTodos) {
    return next(new AppError("Could not found completed todo", 400));
  }
  const ids = await Todo.find({ user: req.userId, completed: true }).select(
    "notificationId -_id"
  );
  await Todo.deleteMany({ user: req.userId, completed: true });
  console.log(ids);
  res.json(ids);
});

exports.getStats = catchAsync(async (req, res, next) => {
  const total = await Todo.countDocuments({ user: req.userId });
  const user = await User.findById(req.userId).select('-password -_id -todos -userImage')
  const active = await Todo.countDocuments({
    user: req.userId,
    completed: false,
  });
  const completed = total - active;
  const response = {
    active,
    completed,
    total,
    fullname:user.firstName+ " " + user.lastName,
    email:user.email
  };
  res.status(200).json(response);
});

exports.getAllStats = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const stats = await Todo.aggregate([
    {
      $match: { user: mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: 1 },
        important: {
          $sum: {
            $cond: ["$important", 1, 0],
          },
        },
        notImportant: {
          $sum: {
            $cond: ["$important", 0, 1],
          },
        },
        completed: {
          $sum: {
            $cond: ["$completed", 1, 0],
          },
        },
        active: {
          $sum: {
            $cond: ["$completed", 0, 1],
          },
        },
      },
    },
    {
      $sort: { total: -1 },
    },
    {
      $addFields: { category: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json(stats);
});
