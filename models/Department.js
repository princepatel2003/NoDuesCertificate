const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const departmentSchema=new Schema({
    
    email:{
        type:String,
        require:true
    },
    
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Students", // Name of the model being referenced
        // unique: true, // Ensures a one-to-one relationship
    }
  ],

});
//to add username,hashing,salting,password
departmentSchema.plugin(passportLocalMongoose);
const Department=mongoose.model("Department",departmentSchema);
module.exports=Department;