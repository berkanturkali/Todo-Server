const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-unique-validator');

const todoSchema = new Schema({
    title:{
        type:String,
        required:true,
        unique:'Title already exists please try another one',        
    },
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
    }
});

todoSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Todo',todoSchema);