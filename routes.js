const router = require("express").Router();
const { body } = require("express-validator");
const {
    homePage,
    register,
    registerPage,
    login,
    loginPage,
    profile,
    profilePage,
    forgotPassword,
    forgotPasswordPage,
    userListingPage,
    getAppUsers,
    deleteUser,
} = require("./controllers/userController");

const {
    addExercisePage,
    exerciseListingPage,
    getExercises,
    deleteExercise,
} = require("./controllers/exerciseController");

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.userID){
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.userID){
        return res.redirect('/');
    }
    next();
}

router.get('/', ifNotLoggedin, homePage);

router.get("/login", ifLoggedin, loginPage);
router.post("/login",
ifLoggedin,
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);

router.get("/signup", ifLoggedin, registerPage);
router.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_phone", "Invalid phone number")
            .notEmpty()
            .escape()
            .trim()
            .isNumeric(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    register
);

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});

router.get('/profile', ifNotLoggedin, profilePage);
router.post(
    "/profile",
    ifNotLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_phone", "Invalid phone number")
            .notEmpty()
            .escape()
            .trim()
            .isNumeric(),
        body("_password").custom((value, { req })=>{
          if(req.body._password !== ''){
            if(req.body._password.length < 4){
                throw new Error('The Password must be of minimum 4 characters length.');
            }
          }
            return true;
        }),
        body("_password_confirmation").custom((value, { req }) => {
            if (value !== req.body._password) {
              throw new Error('Password confirmation does not match password');
            }
            // Indicates the success of this synchronous custom validator
            return true;
          }),
    ],
    profile
);
router.get('/forgot-password',forgotPasswordPage);
router.post(
    "/forgot-password",
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
    ],
    forgotPassword
);

router.get("/users/manage", ifNotLoggedin, userListingPage);

router.post(
    "/users/get-app-users",
    getAppUsers
);
router.post('/users/delete-user', ifNotLoggedin, deleteUser);

router.get("/exercise/add", ifNotLoggedin, addExercisePage);
router.get("/exercise/manage", ifNotLoggedin, exerciseListingPage);
router.post(
    "/exercise/get-exercises",
    getExercises
);
router.post('/exercise/delete-exercise', ifNotLoggedin, deleteExercise);
module.exports = router;
