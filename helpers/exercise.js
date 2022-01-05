const dbConnection = require("../utils/dbConnection");
const helper_general = require("./general");
exports.getExercises = async (req, res, next) => {
  const columns = ['id','title','image','id'];
  let limit = req.body.length;
  let offset = req.body.start;
  let order = columns[req.body['order[0][column]']];
  let dir = req.body['order[0][dir]'];
  return new Promise((resolve, reject)=>{
      var where = {};
      if(req.body.title!==undefined){
        where['title LIKE ?'] = "%" + req.body.title + "%";
      }
      var conditions = helper_general.buildConditionsString(where);
      var sql;
      if(req.body.equipment_id!==undefined){
        sql = "SELECT exercises.*,equipments_exercises.id as equipments_exercises_id  FROM `exercises`";
        sql+=" LEFT JOIN equipments_exercises ON (exercises.id = equipments_exercises.exercise_id && equipments_exercises.equipment_id = "+req.body.equipment_id+") WHERE "+conditions.where;
        order = 'equipments_exercises_id';
      }
      else{
        sql = "SELECT exercises.* FROM `exercises` WHERE "+conditions.where;
      }
      sql+=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
      dbConnection.execute(sql,conditions.values).then((row) => {
          row = JSON.parse(JSON.stringify(row));
          resolve(row[0]);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getExercisesCount = async (req, res, next) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.title!==undefined){
      where['title LIKE ?'] = "%" + req.body.title + "%";
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT id FROM `exercises` WHERE "+conditions.where;
      dbConnection.execute(sql,conditions.values).then((row) => {
          resolve(row[0].length);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getExerciseDetail = async (req) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['e.id = ?'] = req.body.id;
      //where['b.user_id = ?'] = req.user.id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = '';
    sql += "SELECT e.*,b.id as bookmark_id FROM `exercises` as e";
    sql += " LEFT JOIN `bookmarks` as b ON(e.id = b.source_id AND b.user_id="+req.user.id+")";
    sql += " WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
            row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/exercise/'+row[0][0]['image'];
            row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/exercise/thumb/'+row[0][0]['image'];
            resolve(row[0][0]);
        }
        else{
          reject("Data does not exist.");
        }
    }, (err) => {
        reject(err);
    })
  });
}

exports.deleteExerciseVideos = async (id = '') => {

}
