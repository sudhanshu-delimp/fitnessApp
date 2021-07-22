const dbConnection = require("../utils/dbConnection");
const bcrypt = require('bcryptjs');
//const jwt = require("jsonwebtoken");

exports.emailExist = async (email) => {
    const [row] = await dbConnection.execute(
        "SELECT * FROM `users` WHERE `email`=?",
        [email]
    );
    if (row.length == 0) {
        return false;
    }
    else{
        return true;
    }
}

exports.generatePassword = async () => {
    var res = {};
    var randomstring = Math.random().toString(36).slice(-8);
    const hashPass = await bcrypt.hash(randomstring, 12);
    res['password']=randomstring;
    res['hashPassword']=hashPass;
    return res;
}

// exports.verifyToken = (req, res, next) => {
//     let token = req.body.token || req.query.token || req.headers["x-access-token"];
  
//     if (!token) {
//       return res.status(403).send({
//         message: "No token provided!"
//       });
//     }
  
//     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//       if (err) {
//         return res.status(401).send({
//           message: "Unauthorized!"
//         });
//       }
//       req.user = decoded;
//       next();
//     });
//   };