const { validationResult } = require("express-validator");
const fs = require('fs');
const dbConnection = require("../../utils/dbConnection");
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");
const helper_equipment = require("../../helpers/equipment");
const helper_image = require("../../helpers/image");

exports.add_equipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    let uploadedFile = req.files.image;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    let msg = req.body.title;
    image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
    await uploadedFile.mv(`public/uploads/equipment/${image_name}`, (err ) => {
      if (err) {
        return res.status(500).send(err);
        error.push(err);
      }
      helper_image.resize(`public/uploads/equipment/${image_name}`,`public/uploads/equipment/thumb/${image_name}`,300,300);
    });
  }
  try {
    if(error.length == 0){
      var insert = {};
      insert['title'] = req.body.title;
      insert['description'] = req.body.description;
      insert['image'] = image_name;
      var conditions = helper_general.buildInsertConditionsString(insert);
      var sql = "INSERT INTO `equipments`("+conditions.inserts+") VALUES("+conditions.fields+")";
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        let insertId = row[0]['insertId'];
        response['status'] = '1';
        response['data']['message'] = "Data has been added successfully.";
        helper_general.createQrCode({"id":insertId,"source":"equipments"}).then(async (code)=>{
            var where = {};
            var update = {};
            where['id = ?'] = insertId;
            update['qr_code = ?'] = code;
            var conditions = helper_general.buildUpdateConditionsString(update, where);
            var sql = "UPDATE `equipments` SET "+conditions.updates+" WHERE "+conditions.where;
            await dbConnection.execute(sql,conditions.values);
        },(err)=>{
          error.push(err);
          response['data']['error'] = error;
        });
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

exports.getEquipmentDetail = async (req, res, next) => {
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
      var id = req.body.id;
      await helper_equipment.getEquipmentDetail(id).then(row=>{
        response['status'] = '1';
        response['data']['equipment'] = row;
        if(req.xhr === true){
          res.render('equipment/equipment-edit', {
              equipment: row
          });
        }
        response['data']['message'] = "Data found";
      },
      err=>{
        if(req.xhr === true){
          res.render('equipment/equipment-edit', {
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

exports.updateEquipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  if(req.files!==null){
    let old_image = '';
    await helper_equipment.getEquipmentDetail(req.body.id).then(async (row)=>{
      old_image =  row.image;
      await helper_image.removeImage(`public/uploads/equipment/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/thumb/${old_image}`);

      let uploadedFile = req.files.image;
      let fileExtension = uploadedFile.mimetype.split('/')[1];
      let msg = req.body.title;
      image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
      await uploadedFile.mv(`public/uploads/equipment/${image_name}`, (err ) => {
        if (err) {
          return res.status(500).send(err);
          error.push(err);
        }
      });
      await helper_image.resizeLargeFile(`public/uploads/equipment/${image_name}`,`public/uploads/equipment/thumb/${image_name}`,300,300);
    },
    err=>{
      error.push(err);
      response['data']['error'] = error;
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      var update = {};
      if(image_name!==''){
        update['image = ?'] = image_name;
      }

      where['id = ?'] = req.body.id;
      update['title = ?'] = req.body.title;
      update['description = ?'] = req.body.description;

      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `equipments` SET "+conditions.updates+" WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        if(image_name!==''){
          response['data']['image_url'] = `/uploads/equipment/thumb/${image_name}`;
        }
        response['data']['message'] = "Data has been updated successfully.";
      }, (err) => {
          response['data']['error'] = error;
      })
    }
    else{
      response['data']['error'] = error;
    }
    console.log(response);
    res.json(response);
  }
  catch (e) {
    next(e);
  }
}

exports.deleteEquipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    await helper_equipment.getEquipmentDetail(req.body.id).then(async (row)=>{
      old_image =  row.image;
      await helper_image.removeImage(`public/uploads/equipment/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/thumb/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/qr_code/${row.qr_code}`);
    },
    err=>{
      error.push(err);
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      where['id = ?'] = req.body.id;
      var conditions = helper_general.buildDeleteConditionsString(where);
      var sql = "DELETE FROM `equipments` WHERE "+conditions.where;
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

exports.getEquipmentListing = async (req, res, next) => {
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
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      req.body.start = parseInt((++start*length)-length);
      req.body['order[0][column]'] = '0';
      req.body['order[0][dir]'] = 'desc';
      await helper_equipment.getEquipments(req).then((row)=>{
        if(row.length > 0){
          response['status'] = '1';
          row.forEach(function(item,index){
            row[index]['image_original_path'] = '/uploads/equipment/'+item.image;
            row[index]['image_thumb_path'] = '/uploads/equipment/thumb/'+item.image;
          });
          response['data']['equipments'] = row;
        }
        else{
          error.push("Data does not exist.");
          response['data']['error'] = error;
        }
      }, (err)=>{
        error.push(err);
        response['data']['error'] = error;
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
