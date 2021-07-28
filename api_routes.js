const router = require("express").Router();
const { body } = require("express-validator");
const helper_general = require("./helpers/general");

const {
    user_login,
    user_register,
    user_forgot_password,
    user_detail,
    getOtherUserDetail,
    updateUser,
    deleteUser,
} = require("./controllers/api/appUserController");

const {
    add_exercise,
    getExerciseDetail,
    updateExercise,
    deleteExercise,
    getExerciseListing,
} = require("./controllers/api/appExerciseController");

const {
    add_equipment,
    getEquipmentDetail,
    updateEquipment,
    deleteEquipment,
    getEquipmentListing,
} = require("./controllers/api/appEquipmentController");

router.post("/api/login",
    [
        body("email", "Invalid email address.")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("password", "The Password must be of minimum 4 characters length.")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    user_login
);
router.post("/api/register",
    [
      body("name", "The name must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim()
          .isLength({ min: 3 }),
      body("email", "Invalid email address.")
          .notEmpty()
          .escape()
          .trim()
          .isEmail(),
      body("phone", "Invalid phone number")
          .notEmpty()
          .escape()
          .trim()
          .isNumeric(),
        body("password", "The Password must be of minimum 4 characters length.")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    user_register
);
router.post("/api/forgot-password",
    [
    body("email", "Invalid email address")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    ],
    user_forgot_password
);

router.get("/api/user-detail",
[helper_general.verifyToken],
user_detail
);

router.post("/api/get-other-user-detail",
[helper_general.verifyToken],
getOtherUserDetail
);

router.post(
    "/api/update_user",
    [
        helper_general.verifyToken,
        body("name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("email", "Invalid email address.")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("phone", "Invalid phone number")
            .notEmpty()
            .escape()
            .trim()
            .isNumeric(),
        body("password").custom((value, { req })=>{
            if(req.body.password !== ''){
              if(req.body.password.length < 4){
                  throw new Error('The Password must be of minimum 4 characters length.');
              }
            }
            return true;
        }),
    ],
    updateUser
);

router.post(
    "/api/delete_user",
    [
      helper_general.verifyToken,
      body("user_id", "Invalid user id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    deleteUser
);

router.post("/api/add_exercise",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("reps", "Invalid reps")
          .notEmpty()
          .escape()
          .trim(),
      body("sets", "Invalid sets")
          .notEmpty()
          .escape()
          .trim()
          .isNumeric(),
      body("duration", "Invalid duration")
          .notEmpty()
          .escape()
          .trim(),
      body("description", "Invalid description")
          .notEmpty()
          .escape()
          .trim()
          .isLength({ min: 10 }),
      body("image").custom((value, { req })=>{
          let uploadedFile = req.files.image;
          if(uploadedFile.name !== ''){
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          else{
            throw new Error('Uplaod image is required.');
          }
          return true;
      }),
      ],
    add_exercise
);

router.post("/api/get-exercise-detail",
[
  helper_general.verifyToken,
  body("id", "Invalid exercise id.")
  .notEmpty()
  .escape()
  .trim(),
],
getExerciseDetail
);

router.post(
    "/api/update_exercise",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("reps", "Invalid reps")
          .notEmpty()
          .escape()
          .trim(),
      body("sets", "Invalid sets")
          .notEmpty()
          .escape()
          .trim()
          .isNumeric(),
      body("duration", "Invalid duration")
          .notEmpty()
          .escape()
          .trim(),
      body("description", "Invalid description")
          .notEmpty()
          .escape()
          .trim()
          .isLength({ min: 10 }),
      body("image").custom((value, { req })=>{
          if(req.files!==null){
            let uploadedFile = req.files.image;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          return true;
      }),
      ],
    updateExercise
);

router.post(
    "/api/delete_exercise",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    deleteExercise
);

router.post(
    "/api/get-exercise-listing",
    [
      helper_general.verifyToken
    ],
    getExerciseListing
);


router.post("/api/add_equipment",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("description", "Invalid description")
          .notEmpty()
          .escape()
          .trim()
          .isLength({ min: 10 }),
      body("image").custom((value, { req })=>{
          let uploadedFile = req.files.image;
          if(uploadedFile.name !== ''){
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          else{
            throw new Error('Uplaod image is required.');
          }
          return true;
      }),
      ],
    add_equipment
);

router.post("/api/get-equipment-detail",
[
  helper_general.verifyToken,
  body("id", "Invalid equipment id.")
  .notEmpty()
  .escape()
  .trim(),
],
getEquipmentDetail
);

router.post(
    "/api/update_equipment",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("description", "Invalid description")
          .notEmpty()
          .escape()
          .trim()
          .isLength({ min: 10 }),
      body("image").custom((value, { req })=>{
          if(req.files!==null){
            let uploadedFile = req.files.image;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          return true;
      }),
      ],
    updateEquipment
);

router.post(
    "/api/delete_equipment",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    deleteEquipment
);

router.post(
    "/api/get-equipment-listing",
    [
      helper_general.verifyToken
    ],
    getEquipmentListing
);
module.exports = router;
