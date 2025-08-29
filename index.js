const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Students=require("./models/Students.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// const engine = require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const Department=require("./models/Department.js");


// authentication
const passport=require("passport");
const LocalStrategy=require("passport-local");

const session=require("express-session");
const flash=require("connect-flash");
const User=require("./models/user.js")

const studentRouter=require("./routes/student.js");
const departmentRouter=require("./routes/departmentRouter.js");
const downloadRouter=require("./routes/downloadRouter.js");
const userRouter=require("./routes/user.js");

// app.engine("ejs", engine);
app.engine('ejs',ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); //because all the data are coming in requist will be parsed
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

//connection to db = noDues
const MONGO_URL='mongodb://127.0.0.1:27017/noDues';
main()
.then(()=>{
    console.log("connection is successful");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(MONGO_URL);
};

//for the Express-session
const sessionOptions={
    secret:"mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expire:Date.now() + 7 *24*60*60*1000,
        maxAge: 7 *24*60*60*1000,
        httpOnly: true,
    }
}

//use session
app.use(session(sessionOptions));
app.use(flash());
//initialise passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport for User authentication
passport.use(
    "user-local",
    new LocalStrategy(User.authenticate()) // Uses passport-local-mongoose's `authenticate` method
  );
  
  // Configure passport for Department authentication
  passport.use(
    "department-local",
    new LocalStrategy(Department.authenticate()) // Uses passport-local-mongoose's `authenticate` method
  );
  
  // Serialize and deserialize users based on their roles
  passport.serializeUser((entity, done) => {
    done(null, { id: entity.id, type: entity instanceof User ? "user" : "department" });
  });
  
  passport.deserializeUser(async (obj, done) => {
    try {
      if (obj.type === "user") {
        const user = await User.findById(obj.id);
        done(null, user);
      } else if (obj.type === "department") {
        const department = await Department.findById(obj.id);
        done(null, department);
      } else {
        done(new Error("Invalid entity type"));
      }
    } catch (err) {
      done(err);
    }
  });
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// passport.use(new LocalStrategy(Department.authenticate()));
// passport.serializeUser(Department.serializeUser());
// passport.deserializeUser(Department.deserializeUser());



app.get("/",(req,res)=>{
    res.send("app is working");
});

//middleware for the flash
app.use((req,res,next)=>{
    res.locals.success= req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next()
});



app.use("/student",studentRouter);
app.use("/department",departmentRouter);
app.use("/download-pdf",downloadRouter);
app.use("/",userRouter);

// app.get("/department",(req,res)=>{
//     res.render("./infos/department.ejs");
// });
// app.post("/department",async(req,res)=>{
//     const {username,password,email}=req.body.department;
    
//     console.log(username +"--"+password+" "+email);
//         const newUser= new Department({email,username });
//         const registeredUser= await Department.register(newUser,password);
//         await newUser.save();
//     res.redirect("department/verify");
// });
// app.get("department/verify",(req,res)=>{
//      res.send("departmentIndex.ejs");
// })



//for the other route which not exist
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

//middleware controler
app.use((err,req,res,next)=>{
    console.log(err);
    let {statusCode=500, message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
});


  
app.listen(8080,()=>{
    console.log("app is listen on 8080");
});

