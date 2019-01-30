var mongoose = require('mongoose');
Schema = mongoose.Schema;

var OrderSchema = new Schema(
    {
        cart:{type:Object,required:true},
        address:{type:String,required:true},
        name:{type:String},
        paymentId:{type:String},
        Phone:{type:Number}

    }
);
module.exports = mongoose.model('Order',OrderSchema);