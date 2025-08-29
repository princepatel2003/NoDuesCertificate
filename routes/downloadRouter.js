
// const express = require("express");
// const router = express.Router();
// const Students = require("../models/Students.js");
// const puppeteer = require("puppeteer");
// const path = require("path");
// const ejs = require("ejs");
// const { promisify } = require("util");
// const fs = require("fs");

// router.get("/:studentId", async (req, res) => {        
//     try {
//         const { studentId } = req.params;
//         const student = await Students.findById(studentId); 

//         const resRender = promisify(res.render.bind(res));
//         const htmlContent = await resRender("infos/declarationDemo", { student });

//         const browser = await puppeteer.launch({ headless: false,args: ["--no-sandbox", "--disable-setuid-sandbox"], });
//         const page = await browser.newPage();
        

//         // Optional: Debug Puppeteer
//         page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
//         page.on("error", (err) => console.error("PAGE ERROR:", err));
//         page.on("pageerror", (pageErr) => console.error("PAGE PAGEERROR:", pageErr));

//        // Optional: Block unnecessary resources
//        await page.setRequestInterception(true);
    
//     page.on("request", (req) => {
//         const url = req.url();
//         if (
//             req.resourceType() === "stylesheet" ||
//             req.resourceType() === "image" ||
//             req.resourceType() === "font" ||
//             req.resourceType() === "script"
//         ) {
//             // Allow resources from specific domains
//             if (
//                 url.includes("cdn.jsdelivr.net") ||
//                 url.includes("cdnjs.cloudflare.com") ||
//                 url.includes("reck.ac.in")
//             ) {
//                 req.continue();
//             } else {
//                 req.abort();
//             }
//         } else {
//             req.continue();
//         }
//     });
   
//     page.on("requestfailed", (req) => {
//         console.error(`REQUEST FAILED: ${req.url()} | TYPE: ${req.resourceType()}`);
//     });
    
    
//         await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 60000 });
        
//         const pdfBuffer = await page.pdf({
//             format: "A4",
//             printBackground: true,
//         });
        
//         fs.writeFileSync("test.pdf", pdfBuffer);
//         console.log("PDF buffer saved to test.pdf");
        
//         await browser.close();
        

//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", `attachment; filename="No_Dues_Certificate.pdf"`);
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error generating PDF");
//     }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Students = require("../models/Students.js");
const puppeteer = require("puppeteer");
const path = require("path");
const ejs = require("ejs");
const { promisify } = require("util");
const fs = require("fs");

router.get("/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Students.findById(studentId);

        if (!student) {
            return res.status(404).send("Student not found.");
        }

        const resRender = promisify(res.render.bind(res));
        const htmlContent = await resRender("infos/declaration", { student });

        const browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Debug Puppeteer
        page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
        page.on("error", (err) => console.error("PAGE ERROR:", err));
        page.on("pageerror", (pageErr) => console.error("PAGE PAGEERROR:", pageErr));

        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            if (["stylesheet", "image", "font"].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 60000 });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        // Save to a local file for debugging
        fs.writeFileSync("test.pdf", pdfBuffer);
        console.log("PDF saved to test.pdf");

        // Validate the buffer content
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error("PDF buffer is empty or invalid.");
        }

        await browser.close();

        // Send the PDF as a response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="No_Dues_Certificate.pdf"`);
        res.end(pdfBuffer); // Use res.end for sending binary data

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Error generating PDF.");
    }
});

module.exports = router;
