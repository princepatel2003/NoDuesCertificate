const express = require("express");
const router = express.Router();
const Department = require("../models/Department.js");
const Students = require("../models/Students.js");
const passport = require("passport");
const wrapAsync=require("../utils/wrapAsync.js");

// Department Login (GET)
router.get("/login", (req, res) => {
    res.render("departments/login.ejs");
});

// Department Login (POST)
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/department/login",
    failureFlash: "Invalid credentials",
}), (req, res) => {
    req.flash("success", "Welcome to the department dashboard!");
    res.redirect("/department/dashboard");
});
// Department Dashboard (GET)
router.get("/dashboard", async (req, res) => {
    const department = await Department.findOne({ username: req.user.username }).populate("students");   
    res.render("departments/dashboard.ejs", { department });
});

router.post("/:studentId/:departmentName/verify",wrapAsync( async (req, res) => {
        // action="/departments/<%= student._id %>/<%= dept.name %>/verify"
    const { studentId, departmentName } = req.params;
    const student = await Students.findById(studentId);
  
    // Find the specific department and update its status
    const department = student.departments.find((d) => d.name === departmentName);
    department.isVerified = true;
    department.date = new Date();
    await student.save();
    req.flash("success","your verification is succesfull !");
    // res.redirect(`/student/${studentId}/approval`);
     res.redirect("/department/dashboard");
  }));
  // Route to verify a student and add remarks
router.post("/:studentId/:departmentName/remarks", async (req, res) => {
    const { studentId, departmentName } = req.params;
    const { remarks } = req.body;

    try {
        await Students.findByIdAndUpdate(
            studentId,
            {
                $set: {
                    
                    "departments.$[dep].remarks": remarks || "N/A",
                    "departments.$[dep].date": new Date(),
                },
            },
            {
                arrayFilters: [{ "dep.name": departmentName }],
            }
        );

        req.flash("success", "Student verified and remarks added!");
        res.redirect("/department/dashboard");
    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred while verifying the student.");
        res.redirect("/department/dashboard");
    }
});


module.exports = router;