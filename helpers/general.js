const dbConnection = require("../utils/dbConnection");
const bcrypt = require('bcryptjs');

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