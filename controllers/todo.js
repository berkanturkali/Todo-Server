const Todo = require("../models/todo");


exports.addTodo = async(req,res,next) =>{
    const {title,category,date,todo} = req.body;
    const newTodo = new Todo({
        title,
        category,
        date,
        todo,
        user:req.userId
    });
    try{
        await newTodo.save();
        res.status(201).send("Saved todo successfully");
    } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
    
}
