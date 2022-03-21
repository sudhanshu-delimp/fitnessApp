const dbConnection = require("../utils/dbConnection");
const helper_general = require("./general");
const helper_image = require("./image");
const async = require("async");
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
            var exerciseImage = (req.user.gender == 'female')?row[0][0]['female_image']:row[0][0]['image'];
            row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/exercise/'+req.user.gender+'/'+exerciseImage;
            row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/exercise/'+req.user.gender+'/thumb/'+exerciseImage;
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

exports.updateExerciseImage = async (fileObj,title,path,old_file) => {
  return new Promise(async (resolve, reject)=>{
    try {
        let tasks = [];
        tasks.push(async function(cb){
          if(old_file){
            helper_image.removeImage(`public/uploads/exercise/${path}/${old_file}`);
            helper_image.removeImage(`public/uploads/exercise/${path}/thumb/${old_file}`);
          }
          let uploadedFile = fileObj;
          console.log("uploadedFile: "+uploadedFile);
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          console.log("mimetype: "+fileExtension);
          image_name = Date.now()+'-'+path+'-'+title.replace(/\s+/g, "-")+'.' + fileExtension;
          await uploadedFile.mv(`public/uploads/exercise/${path}/${image_name}`, (err ) => {
            if (err) {
              reject(err);
              cb(null,err)
            }
            helper_image.resizeLargeFile(`public/uploads/exercise/${path}/${image_name}`,`public/uploads/exercise/${path}/thumb/${image_name}`,300,300).then((res)=>{
              resolve(image_name);
            });
          });
        });
        tasks.push(function(cb){
          
        })
        async.series(tasks,(err,result)=>{
          if(err){
            reject(err)
          }else{
            resolve(result);
          }
        });        
    }
    catch(err){
      reject(err.message);
    }
  });
}

exports.deleteExerciseVideos = async (id = '') => {

}
