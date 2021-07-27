const dbConnection = require("../utils/dbConnection");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

exports.getOtherUserDetail = async (user_id) => {
  return new Promise((resolve, reject)=>{
        dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [user_id]).then((row) => {
            if(row[0].length > 0){
                resolve(row[0][0]);
            }
            else{
              reject("User does not exist.");
            }
        }, (err) => {
            reject(err);
        })
    })
}

exports.emailExist = async (items) => {
  var conditions = this.buildConditionsString(items);
  return new Promise((resolve, reject)=>{
  var sql = "SELECT id FROM `users` WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        resolve(row[0].length);
    }, (err) => {
        reject(err);
    })
});
}

exports.generatePassword = async () => {
    var res = {};
    var randomstring = Math.random().toString(36).slice(-8);
    const hashPass = await bcrypt.hash(randomstring, 12);
    res['password']=randomstring;
    res['hashPassword']=hashPass;
    return res;
}

exports.verifyToken = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!"
        });
      }
      req.user = decoded;
      next();
    });
  };

  exports.getUsers = async (req, res, next) => {
    const columns = ['id','name','email','phone','id'];
    let limit = req.body.length;
    let start = req.body.start;
    let offset = start;
    let order = columns[req.body['order[0][column]']];
    let dir = req.body['order[0][dir]'];

    return new Promise((resolve, reject)=>{
        var where = {};
        where['role = ?'] = 'app_user';
        var conditions = buildConditions(req,where);
        var sql = "SELECT * FROM `users` WHERE "+conditions.where;
        sql+=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
        dbConnection.execute(sql,conditions.values).then((row) => {
            row = JSON.parse(JSON.stringify(row));
            resolve(row[0]);
        }, (err) => {
            reject(err);
        })
    })
  }

  exports.getUsersCount = async (req, res, next) => {
    return new Promise((resolve, reject)=>{
      var where = {};
      where['role = ?'] = 'app_user';
      var conditions = buildConditions(req,where);
      var sql = "SELECT id FROM `users` WHERE "+conditions.where;
        dbConnection.execute(sql,conditions.values).then((row) => {
            resolve(row[0].length);
        }, (err) => {
            reject(err);
        })
    })
  }

  exports.getSerialNumber = (start,index) => {
    return parseInt(start)+parseInt((index+1));
  }

let buildConditions = (req,where) => {
  const whereNames = Object.keys(where);
  const whereValues = Object.values(where);
  var conditions = [];
  var values = [];
  var conditionsStr;
  whereNames.forEach((value,index)=>{
    conditions.push(value);
    values.push(whereValues[index]);
  });
  if (req.body.name !== '') {
    conditions.push("name LIKE ?");
    values.push("%" + req.body.name + "%");
  }

  if (req.body.email !== '') {
    conditions.push("email LIKE ?");
    values.push("%" + req.body.email + "%");
  }

  if (req.body.phone !== '') {
    conditions.push("phone LIKE ?");
    values.push("%" + req.body.phone + "%");
  }

  return {
    where: conditions.length ? conditions.join(' AND ') : '1',
    values: values
  };
}

  exports.buildConditionsString = (strObject) =>{
  const propertyNames = Object.keys(strObject);
  const propertyValues = Object.values(strObject);
  var conditions = [];
  var values = [];
  propertyNames.forEach((value,index)=>{
    conditions.push(value);
    values.push(propertyValues[index]);
  });
  return {
    where: conditions.length ? conditions.join(' AND ') : '1',
    values: values
  };
}

exports.buildUpdateConditionsString = (update, where) =>{
const updateNames = Object.keys(update);
const updateValues = Object.values(update);
const whereNames = Object.keys(where);
const whereValues = Object.values(where);
var updates = [];
var conditions = [];
var values = [];
updateNames.forEach((value,index)=>{
  updates.push(value);
  values.push(updateValues[index]);
});
whereNames.forEach((value,index)=>{
  conditions.push(value);
  values.push(whereValues[index]);
});
return {
  updates: updates.length ? updates.join(' , ') : '1',
  where: conditions.length ? conditions.join(' AND ') : '1',
  values: values
};
}

exports.buildDeleteConditionsString = (where) =>{
const whereNames = Object.keys(where);
const whereValues = Object.values(where);
var conditions = [];
var values = [];

whereNames.forEach((value,index)=>{
  conditions.push(value);
  values.push(whereValues[index]);
});
return {
  where: conditions.length ? conditions.join(' AND ') : '1',
  values: values
};
}

exports.buildInsertConditionsString = (insert) =>{
const insertNames = Object.keys(insert);
const insertValues = Object.values(insert);
var inserts = [];
var values = [];
var fields = [];
insertNames.forEach((value,index)=>{
  inserts.push(value);
  fields.push('?');
  values.push(insertValues[index]);
});
return {
  inserts: inserts.length ? inserts.join(',') : '1',
  fields: fields.length ? fields.join(',') : '1',
  values: values
};
}
