const nodemailer = require('nodemailer')
const promisify = require('es6-promisify')
const juice = require('juice')
const pug = require('pug')
const htmlToText = require('html-to-text');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlinedHTML = juice(html)
  return inlinedHTML;
}

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const mailOptions = {
    from: 'A R C <noreply@example.com',
    to: options.user.email,
    subject: options.subject,
    html,
    text: htmlToText.fromString(html),
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
}
