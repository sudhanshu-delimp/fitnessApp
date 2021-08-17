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
    editUserProfile,
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
    getEquipmentRelatedExercises,
} = require("./controllers/api/appEquipmentController");

const {
    uploadVideo,
    deleteVideo,
    updateVideo,
    getEquipmentRelatedVideos,
    getExerciseRelatedVideos,
    deleteVideos,
} = require("./controllers/api/appVideoController");

const {
    addWorkout,
    addExerciseIntoWorkout,
    removeExerciseFromWorkout,
    reorderWorkoutExercise,
    workoutExerciseRestTime,
} = require("./controllers/api/appWorkoutController");

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
    "/api/edit_profile",
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
        body("image").custom((value, { req })=>{
            if(req.files !== null && req.files.image!==undefined){
              let uploadedFile = req.files.image;
              let fileExtension = uploadedFile.mimetype.split('/')[1];
              const allowedExtension = ["jpeg", "png", "jpg"];
              if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                  throw new Error('Image File format is not allowed, use only jpeg and png.');
              }
            }
            return true;
        }),
    ],
    editUserProfile
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
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
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
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
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
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
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
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
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

router.post(
    "/api/get-equipment-related-exercises",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    getEquipmentRelatedExercises
);

router.post(
    "/api/upload-video",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("source_id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
      body("type", "Invalid type.")
      .notEmpty()
      .escape()
      .trim(),
      body("thumb_image").custom((value, { req })=>{
        let uploadedFile = req.files.thumb_image;
        if(uploadedFile.name !== ''){
          let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('Thumb image File format is not allowed, use only jpeg and png.');
            }
        }
        else{
          throw new Error('Uplaod Thumb image is required.');
        }
        return true;
    }),
    body("video").custom((value, { req })=>{
    let uploadedFile = req.files.video;
    if(uploadedFile.name !== ''){
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        const allowedExtension = ["mp4"];
        if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
            throw new Error('Video File format is not allowed, use only mp4.');
        }
    }
    else{
        throw new Error('Uplaod Video is required.');
    }
    return true;
    }),
    ],
    uploadVideo
);

router.post(
    "/api/delete_video",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    deleteVideo
);

router.post(
    "/api/update_video",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
      body("thumb_image").custom((value, { req })=>{
        
        if(req.files !== null && req.files.thumb_image!==undefined){
          let uploadedFile = req.files.thumb_image;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('Thumb image File format is not allowed, use only jpeg and png.');
            }
        }
        return true;
    }),
    body("video").custom((value, { req })=>{
        
        if(req.files !== null && req.files.video!==undefined){
            let uploadedFile = req.files.video;
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["mp4"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('Video File format is not allowed, use only mp4.');
            }
        }
        return true;
        }),
    ],
    updateVideo
);

router.post(
    "/api/get-equipment-related-videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    getEquipmentRelatedVideos
);

router.post(
    "/api/get-exercise-related-videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    getExerciseRelatedVideos
);

router.post(
    "/api/delete_videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .escape()
      .trim(),
    ],
    deleteVideos
);

router.post("/api/add_workout",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("schedule_time", "Invalid schedule time")
          .notEmpty()
          .escape()
          .trim(),
      body("schedule_date", "Invalid schedule date")
          .notEmpty()
          .escape()
          .trim(),
      body("description")
          .notEmpty()
          .withMessage("Description is required")
          .escape()
          .trim()
          .isLength({ min: 10 })
          .withMessage("Description's minimum length should be of 10 characters"),
      body("image").custom((value, { req })=>{
          let uploadedFile = req.files.image;
          if(uploadedFile.name !== ''){
            let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          else{
            throw new Error('Uplaod image is required.');
          }
          return true;
      }),
      ],
    addWorkout
);
router.post("/api/add_exercise_into_workout",
    [
        helper_general.verifyToken,
        body("workout_id")
            .notEmpty()
            .withMessage("Workout id is required"),
        body("exercise_id")
            .notEmpty()
            .withMessage("Exercise id is required")
            .custom(async (value, {req})=>{
                if(req.body.exercise_id !== 0 && req.body.workout_id !== 0){
                    var fields = {};
                    fields['exercise_id = ?'] = req.body.exercise_id;
                    fields['workout_id = ?'] = req.body.workout_id;
                    await helper_general.workoutExerciseExist(fields).then(result=>{
                        if(result){
                            throw new Error('Already exist.');
                        }
                    });
                }
                return true;
            }),  
    ],
      addExerciseIntoWorkout
);

router.post("/api/remove_exercise_from_workout",
    [
        helper_general.verifyToken,
        body("id")
            .notEmpty()
            .withMessage("Id is required"),
    ],
    removeExerciseFromWorkout
);

router.post(
    "/api/reorder_workout_exercise",
    [
      helper_general.verifyToken,
      body("ids")
      .custom((value, {req})=>{
        if(!Array.isArray(req.body.ids)){
            throw new Error('Provide array of ids.');
        }
        if(Array.isArray(req.body.ids) && req.body.ids.length == 0){
            throw new Error('Do not send blank array of ids.');
        }
        return true;
    }),
    ],
    reorderWorkoutExercise
);

router.post(
    "/api/workout_exercise_rest_time",
    [
      helper_general.verifyToken,
      body("id")
      .notEmpty()
      .withMessage("Id is required"),
      body("action")
      .notEmpty()
      .withMessage("Action is required")
      .custom((value, {req})=>{
        const allowedAction = ["add", "remove"];
        if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
            throw new Error('Only add and remove actions are allowed.');
        }
        return true;
    }),
    ],
    workoutExerciseRestTime
);
module.exports = router;
