const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({   
    category:{
        type:String,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    todo:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    completed:{
        type:Boolean,
        default:false,
    },
    important:{
        type:Boolean,
        default:false
    },
    notifyMe:{
        type:Boolean,
        required:true
    },
},
{ timestamps: true }
);
module.exports = mongoose.model('Todo', todoSchema);