const { validationResult } = require("express-validator");
const fs = require('fs');
const dbConnection = require("../../utils/dbConnection");
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");

exports.addWorkout = async (req, res, next) => {
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
      if(req.files.image !== undefined){
        let uploadedFile = req.files.image;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
        let image_dir = 'public/uploads/workout';
        let thumb_image_dir = 'public/uploads/workout/thumb';
        await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
          await uploadedFile.mv(image_dir+`/${image_name}`, (err ) => {
            if (err) {
              error.push(err);
            }
            helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
          });
        });
      }
    }
    try {
      if(error.length == 0){
        var insert = {};
        insert['title'] = req.body.title;
        insert['user_id'] = req.user.id;
        insert['schedule_time'] = req.body.schedule_time;
        insert['schedule_date'] = req.body.schedule_date;
        insert['description'] = req.body.description;
        insert['image'] = image_name;
        var conditions = helper_general.buildInsertConditionsString(insert);
        var sql = "INSERT INTO `workouts`("+conditions.inserts+") VALUES("+conditions.fields+")";
        await dbConnection.execute(sql,conditions.values).then((row) => {
          //ResultSetHeader
          response['status'] = '1';
          response['data']['workout_id'] = row[0]['insertId'];
          response['data']['message'] = "Workout has been added successfully.";
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

  exports.addExerciseIntoWorkout = async (req, res, next) => {
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
        var insert = {};
        insert['workout_id'] = req.body.workout_id;
        insert['exercise_id'] = req.body.exercise_id;
        var conditions = helper_general.buildInsertConditionsString(insert);
        var sql = "INSERT INTO `workouts_exercises`("+conditions.inserts+") VALUES("+conditions.fields+")";
        await dbConnection.execute(sql,conditions.values).then((row) => {
          response['status'] = '1';
          response['data']['message'] = "Added successfully.";
        }, (err) => {
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

  exports.removeExerciseFromWorkout = async (req, res, next) => {
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
        where['id = ?'] = req.body.id;
        var conditions = helper_general.buildDeleteConditionsString(where);
        var sql = "DELETE FROM `workouts_exercises` WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
          response['status'] = '1';
          response['data']['message'] = "Deleted successfully.";
        }, (err) => {
            error.push(err);
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

  exports.reorderWorkoutExercise = async (req, res, next) => {
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
        let ids = req.body.ids;
        let count = 1;
        ids.forEach((id)=>{
          var where = {};
          var update = {};
          where['id = ?'] = id;
          update['position = ?'] = count;
          var conditions = helper_general.buildUpdateConditionsString(update, where);
          var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
          dbConnection.execute(sql,conditions.values);
          count++;
        });
        response['status'] = '1';
        response['data']['message'] = "success.";
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

  exports.workoutExerciseRestTime = async (req, res, next) => {
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
        let action = req.body.action;

        var where = {}, update = {};
        where['id = ?'] = req.body.id;
        switch (action) {
          case 'add':{
            let rest_time = req.body.rest_time;
            update['rest_time = ?'] = rest_time;
          } break;
          case 'remove':{
            update['rest_time = ?'] = null;
          } break;
        }
        var conditions = helper_general.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((res)=>{
          response['status'] = '1';
          response['data']['message'] = (action === 'add')?"added":"removed";
        }, (err)=>{
          error.push(err);
          response['data']['error'] = error;
        });
      }
      else{
        response['data']['error'] = error;
      }
      res.json(response);
    } catch (e) {
      next(e);
    }
  }
