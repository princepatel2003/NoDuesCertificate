const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport=require("passport");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const Department = require("../models/Department.js");

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
      req.flash("error", "You must be logged in first!");
      return res.redirect("/login");
  }
  next();
}
//
function isVerified(req, res, next) {
  if (!req.user || !req.user.isVerified) {
      req.flash("error", "You must verify your email before accessing this page.");
      return res.redirect("/student");
  }
  next();
}

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'princepatel2003sk@gmail.com', // replace with your email
      pass: 'wetw ihin xeid unzf', // replace with your email password (use app-specific password if 2FA enabled)
    },
  });

  // Function to generate verification token
function generateVerificationToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  router.get("/verify-email/:token", wrapAsync(async (req, res) => {
      const { token } = req.params;
      // Here, you should find the user by token in your database (store it during the signup)
      const user = await User.findOne({ verificationToken: token });
      
      if (user) {
        user.isVerified = true; // Update the user's verification status
        await user.save();
        req.flash("success", "Email verified successfully!");
        res.redirect("/student");
      } else {
        req.flash("error", "Invalid or expired verification link.");
        res.redirect("/signup");
      }
    }));
  

router.get("/signup",(req,res)=>{
    res.render("./users/signup.ejs");
});

router.post("/signup",wrapAsync(async(req,res,next)=>{
    try{
    const {username,password,email}=req.body;
    const newUser= new User({email,username });
    const registeredUser= await User.register(newUser,password);

    const user=req.user;//get the logged-in user
    // const email=user.email;
  
  // Check if the email domain is "reck.ac.in"
  if (email && email.endsWith("@reck.ac.in")) {
  
    // Send verification email
    const verificationToken = generateVerificationToken(); // A function that generates a token
     const verificationLink = `http://localhost:8080/verify-email/${verificationToken}`;

    // Store the token in the user's record
    newUser.verificationToken = verificationToken;
    await newUser.save();


     const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification for Approval',
      text: `Hello ${username},\n\nPlease click the following link to verify your email and proceed with the approval process: ${verificationLink}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully!");
    } catch (error) {
      console.log("Error sending email: ", error);
    }

    // You can store the verification token in the database or somewhere to verify later
    // Send the token to the student or store it in the session

    req.flash("success", "Verification email sent! Please check your inbox.");
    
  } else {
    req.flash("error", "Only students with 'reck.ac.in' email addresses can proceed.");
    return res.redirect("/signup");
  }
//from chatgpt
req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", "Sign up successful!");
   return res.redirect("/student");
});

    // console.log(registeredUser);
    // let id=User.findByUsername(username);
    // req.flash("success","Welcome back !");
    // res.redirect("/student");
}catch(e){
    req.flash("error", e.message);
    res.redirect("/signup"); 
}
}));




router.get("/login",(req,res)=>{
    res.render("./users/login.ejs");
});

router.post(
  "/login",
  wrapAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // Try User authentication
    passport.authenticate("user-local", async (err, user) => {
      if (err) return next(err);
      
      if (user && user.email.endsWith("@reck.ac.in") ) {
        await req.login(user, (err) => {
          if (err) return next(err);
          req.flash("success", "Welcome back, User!");
          const studentId = user.student;
          if (studentId) {
            return res.redirect(`/student/${studentId}/approval`);
          }
          return res.redirect("/student");
        });
      } else {
        // If User fails, try Department authentication
        passport.authenticate("department-local", async (err, department) => {
          if (err) return next(err);
          if (department) {
            await req.login(department, (err) => {
              if (err) return next(err);
              req.flash("success", "Welcome to the Department Dashboard!");
              return res.redirect("/department/dashboard");
            });
          } else {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
          }
        })(req, res, next);
      }
    })(req, res, next);
  })
);


router.get("/logout",(req,res,next)=>{
  req.logout((err=>{
      if(err){
          return next(err);
      }
      req.flash("success","you are logged out!");
      res.redirect("/login");
  }))
})


module.exports=router;
