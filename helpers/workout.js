const dbConnection = require("../utils/dbConnection");
const helper_general = require("./general");
const async = require("async");

exports.getWorkouts = async (req, res, next) => {
  const columns = ['id','title','image','id'];
  let limit = req.body.length;
  let offset = req.body.start;
  let order = columns[req.body['order[0][column]']];
  let dir = req.body['order[0][dir]'];
  return new Promise((resolve, reject)=>{
      var where = {};
      if(req.body.title!==undefined){
        where['w.title LIKE ?'] = "%" + req.body.title + "%";
      }
      if(req.body.user_id!==undefined){
        where['w.user_id = ?'] = req.body.user_id;
      }
      else{
        where['w.user_id = ?'] = req.user.id;
      }
      if(req.body.is_finished!==undefined){
        where['w.is_finished = ?'] = req.body.is_finished;
      }
      var conditions = helper_general.buildConditionsString(where);
      var sql;
      sql = "SELECT w.* FROM `workouts` AS w";
      sql+=" WHERE "+conditions.where;
      sql+=" ORDER BY w."+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
      dbConnection.execute(sql,conditions.values).then(async (row) => {
          row = JSON.parse(JSON.stringify(row));
          let tasks = [];
          row[0].forEach(async (item,index)=>{
            tasks.push(function(cb){
              workoutDuration(item.id).then((data)=>{
                row[0][index]['workout_duration'] = data;
                cb(null, data )
              },(err)=>{
                cb(null,err)
              })
            })
            tasks.push(function(cb){
              exports.workoutProgress(item.id).then((data)=>{
                row[0][index]['workout_progress_percentage '] = data;
                cb(null, data )
              },(err)=>{
                cb(null,err)
              })
            })
          });
          async.series(tasks,(err,result)=>{
            if(err){
              reject(err)
            }else{
              resolve(row[0]);
            }
          })

      }, (err) => {
          reject(err);
      })
  })
}

function workoutDuration(workout_id){
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT sum(e.duration) as workout_duration FROM `workouts_exercises` AS we";
    sql+=" LEFT JOIN `exercises` AS e ON(e.id = we.exercise_id)";
    sql+=" WHERE "+conditions.where;
    try{
      let row = await dbConnection.execute(sql,conditions.values);
      resolve((row[0][0].workout_duration > 0)?row[0][0].workout_duration:0);
    } catch(e){
      reject(e);
    }
});
}

exports.workoutProgress = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    try {
      let workout_progress = 0;
      let total_exercise_count =  await exports.getWorkoutExerciseCount(workout_id);
      let done_exercise_count =  await exports.getWorkoutDoneExerciseCount(workout_id);
      if(total_exercise_count!==0){
          workout_progress = (parseInt(done_exercise_count)*100)/parseInt(total_exercise_count);
      }
      resolve(workout_progress);
    }
    catch (e) {
      reject(e);
    }
  });

}

exports.getWorkoutExerciseCount = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT count(we.id) as exercise_count FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].exercise_count);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkoutDoneExerciseCount = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    where['we.status = ?'] = 'Done';
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT count(we.id) as done_exercise_count FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].done_exercise_count);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkDetail = async (req) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['w.id = ?'] = req.body.id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT w.* FROM `workouts` as w";
    sql += " WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then(async(row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
            row[0][0]['workout_duration'] = await workoutDuration(row[0][0]['id']);
            row[0][0]['workout_progress_percentage'] = await exports.workoutProgress(row[0][0]['id']);
            row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/workout/'+row[0][0]['image'];
            row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/workout/thumb/'+row[0][0]['image'];
            resolve(row[0][0]);
        }
        else{
          reject("Data does not exist.");
        }
    }, (err) => {
        reject(err.message);
    })
  });
}
