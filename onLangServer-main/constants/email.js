const path = require('path')
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');

// const transporter = nodemailer.createTransport({
//     // service: 'Godaddy',
//     host: "mail.onlang.net",
//     port: 587, // port for secure
//     // secureConnection: true,
//   	auth: {
//   		user: "application@onlang.net",
//   		pass: "4A%L9P88dS",
//   	}
// });

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  //host: "mail.onlang.net",
  port: 587,
  
  auth: {
    user: "info@onlang.net",
    pass: "OnLang2023*"
  },
  tls: {
    rejectUnauthorized: false
  }
});

const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve('./views'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./views'),
  extName: ".handlebars",
}

transporter.use('compile', hbs(handlebarOptions));


transporter.sendEMail = function (mailRequest)
{
  return new Promise(function (resolve, reject)
  {
    transporter.sendMail(mailRequest, (error, info) =>
    {
      if (error)
      {
        reject(error);
      } else
      {
        resolve("The message was sent!");
      }
    });
  });
}


module.exports = transporter;
