const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const helper_general = require("../helpers/general");
// Home Page
let getUserInfo = (user_id) => {
    return new Promise((resolve, reject)=>{
        dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [user_id]).then((row) => {
            row = JSON.parse(JSON.stringify(row));
            resolve(row[0]);
        }, (err) => {
            reject(err);
        })
    })
};

exports.homePage = async (req, res, next) => {
    res.render('home', {
        title: 'Welcome to Fitness | Home'
    });
}

// Register Page
exports.registerPage = (req, res, next) => {
            res.render('register', {
                title: 'Welcome to Fitness | Register'
            });
        };

    // User Registration
    exports.register = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;

        if (!errors.isEmpty()) {
            return res.render('register', {
                error: errors.array()[0].msg,
                title: 'Welcome to Fitness | Register'
            });
        }

        try {

            const [row] = await dbConnection.execute(
                "SELECT * FROM `users` WHERE `email`=?",
                [body._email]
            );

            if (row.length >= 1) {
                return res.render('register', {
                    error: 'This email already in use.',
                    title: 'Welcome to Fitness | Register'
                });
            }

            const hashPass = await bcrypt.hash(body._password, 12);

            const [rows] = await dbConnection.execute(
                "INSERT INTO `users`(`role`,`name`,`email`,`phone`,`password`) VALUES(?,?,?,?,?)",
                ['admin', body._name, body._email, body._phone, hashPass]
            );

            if (rows.affectedRows !== 1) {
                return res.render('register', {
                    error: 'Your registration has failed.',
                    title: 'Welcome to Fitness | Register'
                });
            }

            res.render("register", {
                msg: 'You have successfully registered.',
                title: 'Welcome to Fitness | Register'
            });

        } catch (e) {
            next(e);
        }
    };

    // Login Page
    exports.loginPage = (req, res, next) => {
        res.render('login', {
            title: 'Welcome to Fitness | Login'
        });
    };

    // Login User
    exports.login = async (req, res, next) => {

        const errors = validationResult(req);
        const { body } = req;

        if (!errors.isEmpty()) {
            return res.render('login', {
                error: errors.array()[0].msg,
                title: 'Welcome to Fitness | Login'
            });
        }

        try {
            var errorMessage = '';
            const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [body._email]);

            if (row.length != 1) {
                return res.render('login', {
                    error: 'Invalid email address.',
                    title: 'Welcome to Fitness | Login'
                });
            }

            if (row[0].role !== 'admin') {
                errorMessage = 'You are not a valid admin user.';
            }

            const checkPass = await bcrypt.compare(body._password, row[0].password);

            if (checkPass === true && errorMessage === '') {
                var token = jwt.sign({ id: row[0].id,email: row[0].email,phone: row[0].phone}, process.env.JWT_SECRET_KEY, {
                  expiresIn: 86400 // 24 hours
                });
                req.session.userID = row[0].id;
                req.session.accessToken = token;
                global.accessToken = token;
                global.user = row[0];
                return res.redirect('/');
            }
            else if (errorMessage !== '') {
                errorMessage = errorMessage;
            }
            else {
                errorMessage = 'Invalid Password.';
            }

            res.render('login', {
                error: errorMessage,
                title: 'Welcome to Fitness | Login'
            });


        }
        catch (e) {
            next(e);
        }

    }

    exports.profilePage = async (req, res, next) => {
        res.render('profile', {
            title: 'Welcome to Fitness | Profile',
            page_title: 'Profile'
        });
    }

    // Edit User Profile
    exports.profile = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        if (!errors.isEmpty()) {
            let data = await getUserInfo(req.session.userID);
            return res.render('profile', {
                error: errors.array()[0].msg,
                title: 'Welcome to Fitness | Profile',
                page_title: 'Profile'
            });
        }

        try {
            if (body._password !== '') {
                const hashPass = await bcrypt.hash(body._password, 12);
                const [row] = await dbConnection.execute(
                    "UPDATE users SET name = ?,phone = ?,password = ? WHERE id = ?",
                    [body._name, body._phone, hashPass, req.session.userID]
                );
                if (row.affectedRows !== 1) {
                    return res.render('register', {
                        error: 'Unable to update profile.',
                        title: 'Welcome to Fitness | Register'
                    });
                }
            }
            else {
                const [row] = await dbConnection.execute(
                    "UPDATE users SET name = ?,phone = ? WHERE id = ?",
                    [body._name, body._phone, req.session.userID]
                );
                if (row.affectedRows !== 1) {
                    return res.render('register', {
                        error: 'Unable to update profile.',
                        title: 'Welcome to Fitness | Register'
                    });
                }
            }
            let data = await getUserInfo(req.session.userID);
            global.user = data[0];
            res.render("profile", {
                msg: 'Your Profile has been updated successfully.',
                title: 'Welcome to Fitness | Profile',
                page_title: 'Profile'
            });

        } catch (e) {
            next(e);
        }
    };

    // Forgot Password Page
    exports.forgotPasswordPage = (req, res, next) => {
        res.render('forgot-password', {
            title: 'Welcome to Fitness | Forgot Password',
            page_title: 'Forgot Password'
        });
    };

    // Edit User Profile
    exports.forgotPassword = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;

        if (!errors.isEmpty()) {
            return res.render('forgot-password', {
                error: errors.array()[0].msg,
                title: 'Welcome to Fitness | Forgot Password',
                page_title: 'Forgot Password'
            });
        }

        try {
            const [row] = await dbConnection.execute(
                "SELECT * FROM `users` WHERE `email`=?",
                [body._email]
            );

            if (row.length == 0) {
                return res.render('forgot-password', {
                    error: 'This email does not exist in the system.',
                    title: 'Welcome to Fitness | Forgot Password',
                    page_title: 'Forgot Password'
                });
            }
            else {
                var randomstring = Math.random().toString(36).slice(-8);
                const hashPass = await bcrypt.hash(randomstring, 12);
                await dbConnection.execute(
                    "UPDATE users SET password = ? WHERE email = ?",
                    [hashPass, body._email]
                );
                const fetch = require('node-fetch');
                const url = 'https://api.sendinblue.com/v3/smtp/email';
                const options = {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'api-key': process.env.SEND_IN_BLUE_API
                    },
                    body: JSON.stringify({
                        to: [{ email: body._email }],
                        params: { 'password': randomstring },
                        templateId: 10
                    })
                };

                fetch(url, options)
                    .then(res => res.json())
                    .then(json => {
                        console.log(json);
                        return res.render('forgot-password', {
                            msg: 'Rest password has been sent to your registered email address, please check your inbox.',
                            title: 'Welcome to Fitness | Forgot Password',
                            page_title: 'Forgot Password'
                        });
                    })
                    .catch(err => {
                        return res.render('forgot-password', {
                            error: err,
                            title: 'Welcome to Fitness | Forgot Password',
                            page_title: 'Forgot Password'
                        });
                    });


            }

        } catch (e) {
            next(e);
        }
    };

  // User Listing Page
exports.userListingPage = async (req, res, next) => {

  res.render('users/user-listing', {
      title: 'Welcome to Fitness | Users',
      page_title: 'Manage Users'
  });
}

// Get users list
exports.getAppUsers = async (req, res, next) => {
  let users = [];
  let totalFiltered = 0;
  let data = [];
  await helper_general.getUsers(req).then(row=>{
    users = row;
  },err=>{
    res.json(err);
  });
  await helper_general.getUsersCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    users.forEach((user,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['name'] = user.name;
      nestedData['email'] = user.email;
      nestedData['phone'] = user.phone;
      nestedData['options'] = '<div class="btn-group">';
      nestedData['options'] += '<button class="btn btn-secondary btn-sm main-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<ul class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editUser(this)" data-id = "'+user.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i> Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteUser(this)" data-id = "'+user.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i> Delete</a></li>';
      nestedData['options'] += '</ul>';
      nestedData['options'] += '</div>';
      data.push(nestedData);
    });

  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.deleteUser = async (req, res, next) => {
  var user_id = req.body.user_id;
  await helper_general.getOtherUserDetail(user_id).then(row=>{
    res.render('users/user-delete', {
        user: row
    });
  },err=>{
    res.render('users/user-delete', {
        error: err
    });
  });
}
