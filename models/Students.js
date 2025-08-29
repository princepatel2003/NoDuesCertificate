const { text } = require("figlet");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const infoSchema=new Schema({
    regNo:{
        type:Number,
        require:true
    },
    yearOfAdmission:{
        type:Number,
        reqquire:true
    },
    courseStatus:{
        type:String,
        default:"Completed",
        set:(v)=>v==""
        ?"Completed"
        :v,
    },
    studentName:{
        type:String,
        require:true,
    },
    rollNo:{
        type:Number,
        require:true,
    },
    branch:{
        type:String,
        require:true,
    },
    departments:[
        {
            name:String,
            isVerified:{type:Boolean,default:false},
            date:Date,
            remarks:String,
        
        },
    ],
    // Reference to the User model
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Name of the model being referenced
        // unique: true, // Ensures a one-to-one relationship
    },

});
//to add username,hashing,salting,password
infoSchema.plugin(passportLocalMongoose);
const Students=mongoose.model("Students",infoSchema);
module.exports=Students;