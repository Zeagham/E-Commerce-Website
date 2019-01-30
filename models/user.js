
var mongoose = require('mongoose');
Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name:{type: String, required: true},
        email:{type:String, required:true},
        password:{type:String,required:true},
        role:{type:String},
    }
);
module.exports = mongoose.model('User',UserSchema);

