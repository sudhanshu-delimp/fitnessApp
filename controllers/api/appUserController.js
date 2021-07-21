const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const dbConnection = require("../../utils/dbConnection");

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
        response['status'] = '1';
        response['data']['message'] = "You have successfully registered.";
      }
    }
    else{
      response['data']['error'] = error;
    }
    res.send(response);
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
        response['status'] = '1';
        response['data']['user'] = row[0];
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
