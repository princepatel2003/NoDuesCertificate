const express=require("express");
const router=express.Router();
const Students=require("../models/Students.js");
const Department=require("../models/Department.js");
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }
    next();
}
function isVerified(req, res, next) {
    if (!req.user || !req.user.isVerified) {
        req.flash("error", "You must verify your email before accessing this page.");
        return res.redirect("/signup");
    }
    next();
}

router.get("/",isLoggedIn,isVerified,(req,res)=>{
    res.render("./infos/studentInfo.ejs");
});
router.post("/",isLoggedIn,wrapAsync(async(req,res)=>{
try{  
    const { regNo, yearOfAdmission, courseStatus, studentName, rollNo, branch } = req.body.students;
   const user=req.user;

  const departments = [
    { name: 'Head of Department', isVerified: false },
    { name: 'Departmental Labs', isVerified: false },
    { name: 'Applied Science lab', isVerified: false },
    { name: 'Workshop', isVerified: false },
    { name: 'Warden(Boys & Girls)', isVerified: false },
    { name: 'Central Library', isVerified: false },
    { name: 'Sport', isVerified: false },
    { name: 'Computer Centre', isVerified: false },
    { name: 'Examination Office', isVerified: false },
    { name: 'Account Office', isVerified: false },
    { name: 'Dean Office', isVerified: false },
  ];
  const student = new Students({
    regNo,
    yearOfAdmission,
    courseStatus,
    studentName,
    rollNo,
    branch,
    departments,
    user:user._id,//link to the user model
    username: req.user.username,
  });
  await student.save();
  user.student = student._id; // Link the User model to the Student
    await user.save();

    res.redirect(`/student/${student._id}/approval`);
}catch(e){
     req.flash("error",e.message);
     res.redirect("/login");
}
}));
router.get("/:id/approval",isLoggedIn,isVerified,wrapAsync(async(req,res)=>{
    const student=await Students.findById(req.params.id);
    res.render("./infos/index.ejs",{student});
}));
router.post('/:studentId/:departmentName/verify', wrapAsync(async (req, res) => {
    const { studentId, departmentName } = req.params;
    // Find the department by its name
    const department = await Department.findOne({ username: departmentName });
    if (!department) {
        req.flash('error', 'Department not found.');
        return res.redirect(`/student/${studentId}/approval`);
    }

    // Check if the studentId is already in the students array
    if (!department.students.includes(studentId)) {
        department.students.push(studentId); // Push studentId to the array
        await department.save(); // Save the updated department
        req.flash('success', 'Verification proceed!');
    } else {
        req.flash('error', 'Student already verified for this department.');
    }
    res.redirect(`/student/${studentId}/approval`);
}));
router.get("/:id/declaration",async(req,res)=>{
    const student=await Students.findById(req.params.id);
    res.render("./infos/declaration.ejs",{student});
})


module.exports=router;