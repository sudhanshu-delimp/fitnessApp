const dbConnection = require("../utils/dbConnection");
const helper_general = require("./general");
exports.getEquipments = async (req, res, next) => {
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
      var sql = "SELECT * FROM `equipments`  WHERE "+conditions.where;
      sql+=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
      dbConnection.execute(sql,conditions.values).then((row) => {
          row = JSON.parse(JSON.stringify(row));
          resolve(row[0]);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getEquipmentsCount = async (req, res, next) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.title!==''){
      where['title LIKE ?'] = "%" + req.body.title + "%";
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT id FROM `equipments`  WHERE "+conditions.where;
      dbConnection.execute(sql,conditions.values).then((row) => {
          resolve(row[0].length);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getEquipmentDetail = async (id = '') => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(id!==''){
      where['id = ?'] = id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT * FROM `equipments`  WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
            row[0][0]['image_original_path'] = '/uploads/equipment/'+row[0][0]['image'];
            row[0][0]['image_thumb_path'] = '/uploads/equipment/thumb/'+row[0][0]['image'];
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
