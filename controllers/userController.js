const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");

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
    let data = await getUserInfo(req.session.userID);
    if (data.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('home', {
        user: data[0],
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
                req.session.userID = row[0].id;
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
        let data = await getUserInfo(req.session.userID);
        if (data.length !== 1) {
            return res.redirect('/logout');
        }

        res.render('profile', {
            user: data[0],
            title: 'Welcome to Fitness | Profile',
            page_title: 'Profile'
        });
    }

    // Edit User Profile
    exports.profile = async (req, res, next) => {
        const errors = validationResult(req);
        const { body } = req;
        let data = await getUserInfo(req.session.userID);
        if (!errors.isEmpty()) {

            return res.render('profile', {
                error: errors.array()[0].msg,
                user: data[0],
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

            res.render("profile", {
                msg: 'Your Profile has been updated successfully.',
                user: data[0],
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
                        'api-key': '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'
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
