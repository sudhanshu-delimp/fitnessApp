const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
//const jwt = require("jsonwebtoken");
const dbConnection = require("../../utils/dbConnection");
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");

exports.user_register = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [req.body.email]);
    if (row.length >= 1) {
        error.push('This email already in use.');
    }
  }
  try {
    if(error.length == 0){
      const hashPass = await bcrypt.hash(req.body.password, 12);
      const [rows] = await dbConnection.execute(
          "INSERT INTO `users`(`role`,`name`,`email`,`phone`,`password`) VALUES(?,?,?,?,?)",
          ['app_user', req.body.name, req.body.email, req.body.phone, hashPass]
      );
      if(rows.affectedRows !== 1) {
        response['data']['error'] = ['Your registration has failed.'];
      }
      else{
        var params = {
          'user_name':req.body.name,
          'email':req.body.email,
          'password':req.body.password
        };
        await helper_email.sendEmail(req.body.email, params, 11).then(result=>{
          response['status'] = '1';
          response['data']['email'] = result.data;
          response['data']['message'] = "You have successfully registered.";
        },err=>{
          response['data']['error'] = err;
        });
        
      }
    }
    else{
      response['data']['error'] = error;
    }
    res.json(response);
  }
  catch (e) {
      next(e);
  }
}

exports.user_login = async (req, res, next) => {
    const errors = validationResult(req);
    var error = [];
    var response = {};
    response['status'] = '0';
    response['data'] = {};
    if (!errors.isEmpty()) {
      error.push(errors.array()[0].msg);
    }
    else{
      const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [req.body.email]);
      if (row.length != 1) {
          error.push('Email address does not exist.');
      }
      else{
        const checkPass = await bcrypt.compare(req.body.password, row[0].password);
        if (checkPass !== true) {
            error.push('Invalid Password.');
        }
      }
    }
    try {
      if(error.length == 0){
        const [row] = await dbConnection.execute('SELECT id,name,phone,email FROM `users` WHERE `email`=?', [req.body.email]);
        // var token = jwt.sign({ id: row[0].id,email: row[0].email,phone: row[0].phone}, process.env.JWT_SECRET_KEY, {
        //   expiresIn: 86400 // 24 hours
        // });
        response['status'] = '1';
        response['data']['user'] = row[0];
        response['data']['accessToken'] = '';
      }
      else{
        response['data']['error'] = error;
      }
      res.json(response);
    }
    catch (e) {
        next(e);
    }
}

exports.user_forgot_password = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    await helper_general.emailExist(req.body.email).then(result=>{
      if(result === false){
        error.push('This email does not exist in the system.');
      }
    });
  }
  try {
    if(error.length == 0){
      var generatePass = await helper_general.generatePassword();
      await dbConnection.execute(
        "UPDATE users SET password = ? WHERE email = ?",
        [generatePass.hashPassword, req.body.email]
      );
      var params = {
        'password':generatePass.password
      };
      await helper_email.sendEmail(req.body.email, params, 10).then(result=>{
        response['status'] = '1';
        response['data']['email'] = result.data;
        response['data']['new_password'] = generatePass.password;
        response['data']['message'] = "Please check your inbox to get new password";
      },err=>{
        response['data']['error'] = err;
      });
    }
    else{
      response['data']['error'] = error;
    }
    res.json(response);
  }
  catch (e) {
      next(e);
  }
}

exports.user_detail = (req, res) => {
  res.json(req.user);
}
