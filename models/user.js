const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema=new Schema({
    email:{
        type:String,
        require:true,
        // unique: true,
    },
     // Reference to the Student model
     student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        validate: {
            validator: function (v) {
                return v != null; // Ensure the field is not null
            },
            message: "Student reference cannot be null.",
        },
    },
    verificationToken: String, // Store verification token here
  isVerified: { type: Boolean, default: false }, // Field to track verification status
});
//to add username,hashing,salting,password
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);