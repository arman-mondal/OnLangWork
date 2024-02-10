const express = require("express");
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "300s" });
}

router.post("/", urlencodedParser, async (req, res) => {
  if (req.body.email === "no") {
    res.json({ code: 400, message: "No User Found" });
  } else {
    let table = "college";
    let user = await prisma.college.findFirst({
      where: {
        email: req.body.email,
        status: 0,
      },
    });
    if (!user) {
      table = "teacher";
      user = await prisma.teacher.findFirst({
        where: {
          email: req.body.email,
          status: 0,
        },
      });
      if (!user) {
        table = "student";
        user = await prisma.student.findFirst({
          where: {
            email: req.body.email,
            status: 0,
          },
        });
        if (!user) {
          res.json({ code: 400, message: "No User Found" });
          return;
        }
      }
    }
    let token = "";
    if (table === "college") {
      token = generateAccessToken({
        collegeid: user.collegeid,
        collegename: user.collegename,
      });
      console.log(user.collegeid);
      user = await prisma.college.update({
        where: { collegeid: user.collegeid },
        data: { jwt: token },
      });
    } else {
      if (table === "student") {
        token = generateAccessToken({
          collegeid: user.studentid,
          studentname: user.firstname,
        });
        user = await prisma.student.update({
          where: { studentid: user.studentid },
          data: { jwt: token },
        });
      } else {
        if (table === "teacher") {
          token = generateAccessToken({
            teacherid: user.teacherid,
            teachername: user.firstname,
          });
          user = await prisma.teacher.update({
            where: { teacherid: user.teacherid },
            data: { jwt: token },
          });
        }
      }
    }

    let mailOptions = {
      from: "On Lang <info@onlang.net>",
      to: req.body.email,
      bcc: "application@onlang.net",
      subject: "Reset Password",
      template: "forgotPassword",
      context: {
        token: token,
      },
    };
    mail
      .sendMail(mailOptions)
      .then(function (email) {
        console.log("mail send", email);
      })
      .catch(function (exception) {
        console.log(exception);
      });
    res.json({
      code: 200,
      message: "Succseefull",
    });
  }
});
module.exports = router;
