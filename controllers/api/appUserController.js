const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const dbConnection = require("../../utils/dbConnection");
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");

exports.getOtherUserDetail = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  try {
    if(error.length == 0){
      var user_id = req.body.user_id;
      await helper_general.getOtherUserDetail(user_id).then(row=>{
        response['status'] = '1';
        response['data']['user'] = row;
        if(req.xhr === true){
          res.render('users/user-edit', {
              user: row
          });
        }
        response['data']['message'] = "Data found";
      },
      err=>{
        if(req.xhr === true){
          res.render('users/user-edit', {
              error: err
          });
        }
        else{
          error.push(err);
          response['data']['error'] = error;
        }
      });
    }
    else{
      response['data']['error'] = error;
    }
    if(req.xhr === false){
      res.json(response);
    }
  } catch (e) {
    next(e);
  }
}

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
        var token = jwt.sign({ id: row[0].id,email: row[0].email,phone: row[0].phone}, process.env.JWT_SECRET_KEY, {
          expiresIn: 86400 // 24 hours
        });
        response['status'] = '1';
        response['data']['user'] = row[0];
        response['data']['accessToken'] = token;
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
    var fields = {};
    fields['email = ?'] = req.body.email;
    await helper_general.emailExist(fields).then(result=>{
      if(!result){
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

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    var fields = {};
    fields['email = ?'] = req.body.email;
    fields['id != ?'] = req.body.user_id;
    await helper_general.emailExist(fields).then(result=>{
      if(result){
        error.push('This email already in use.');
      }
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      var update = {};
      where['id = ?'] = req.body.user_id;
      update['name = ?'] = req.body.name;
      update['email = ?'] = req.body.email;
      update['phone = ?'] = req.body.phone;
      if(req.body.password !== ''){
        update['password = ?'] = await bcrypt.hash(req.body.password, 12);;
      }
      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `users` SET "+conditions.updates+" WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        response['data']['message'] = "Data has been updated successfully.";
      }, (err) => {
          response['data']['error'] = error;
      })
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

exports.deleteUser = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  try {
    if(error.length == 0){
      var where = {};
      where['id = ?'] = req.body.user_id;
      var conditions = helper_general.buildDeleteConditionsString(where);
      var sql = "DELETE FROM `users` WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        response['data']['message'] = "Data has been deleted successfully.";
      }, (err) => {
          response['data']['error'] = error;
      })
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
