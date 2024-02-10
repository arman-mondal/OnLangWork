const express = require("express");
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");
var mail = require("../../constants/email");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

var router = express.Router();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post("/", urlencodedParser, async (req, res) => {
  const authToken = req.body.authToken;
  if (!authToken) {
    res.json({ code: 400, message: "No User Found" });
  } else {
    let table = "college";
    let user = await prisma.college.findFirst({
      where: {
        jwt: authToken,
        status: 0,
      },
    });
    if (!user) {
      table = "teacher";
      user = await prisma.teacher.findFirst({
        where: {
          jwt: authToken,
          status: 0,
        },
      });
      if (!user) {
        table = "student";
        user = await prisma.student.findFirst({
          where: {
            jwt: authToken,
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
      console.log(user.collegeid);
      user = await prisma.college.update({
        where: { collegeid: user.collegeid },
        data: { password: req.body.password },
      });
    } else {
      if (table === "student") {
        user = await prisma.student.update({
          where: { studentid: user.studentid },
          data: { password: req.body.password },
        });
      } else {
        if (table === "teacher") {
          user = await prisma.teacher.update({
            where: { teacherid: user.teacherid },
            data: { password: req.body.password },
          });
        }
      }
    }
    res.json({ code: 200, message: "Succseefull" });
  }
});
module.exports = router;
