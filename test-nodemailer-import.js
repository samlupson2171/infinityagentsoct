const nodemailer = require('nodemailer');

console.log('Nodemailer object:', typeof nodemailer);
console.log('Keys:', Object.keys(nodemailer));
console.log('createTransporter:', typeof nodemailer.createTransporter);
console.log('default:', typeof nodemailer.default);

if (nodemailer.default) {
  console.log('default.createTransporter:', typeof nodemailer.default.createTransporter);
}
