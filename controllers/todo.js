const SuccessResponse = require("../models/success_response");
const Todo = require("../models/todo");
const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.addTodo = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { category, date, todo, important, notifyMe } =
    req.body;
  const newTodo = new Todo({
    category,
    date,
    todo,
    user: req.userId,
    important,
    notifyMe,
  });
  await newTodo.save();
  let response = new SuccessResponse("Your new todo saved successfully!").toJson();
  res.status(201).json(response);
});
exports.getTodos = catchAsync(async (req, res, next) => {
  let { filter, category } = req.query;  
  const currentPage = req.query.page || 1;
  const perPage = parseInt(req.query.limit);
  let totalItems;
  let filters = [];
  let categoryQuery = {};
  if (category != "all") {
    categoryQuery["category"] = category
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
    .sort({ date: -1 })
    .sort({createdAt: -1})
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
  
  let response = new SuccessResponse();

  response.data = todos;
  console.log(response);  
  res.status(200).json(response.toJson());
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
    { completed: completed }
  );

  let response = new SuccessResponse();
  response.data = todo;
  response.message = "Updated successfully."
  res.status(200).json(response.toJson());
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
    notifyMe
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
  let response = new SuccessResponse();
  response.data = todo
  response.message = "Todo has been deleted successfully."
  res.status(200).json(response.toJson());
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
  const response = new SuccessResponse();
  response.message = "Completed todos have been deleted successfully";
  res.status(200).json(response.toJson());
});

exports.deleteAllTodos = catchAsync(async (req, res, next) => {
  await Todo.deleteMany({ user: req.userId });
  let response = new SuccessResponse();
  response.message = "All todos deleted successfully."
  res.status(200).json(response.toJson());
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

  let successResponse = new SuccessResponse();
  successResponse.data = response
  res.status(200).json(successResponse.toJson());
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

  let response = new SuccessResponse();

  response.data = stats
  console.log(`all stats = ${stats}`);
  
  res.status(200).json(response.toJson());
});
