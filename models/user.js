const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userImage:String,
    todos:[
        {
            type:Schema.Types.ObjectId,
            ref:'Todo'
        }
    ]
});


module.exports = mongoose.model('User',userSchema);
