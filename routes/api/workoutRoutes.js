const express = require('express');
const workoutRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");

const appWorkoutController = require("../../controllers/api/appWorkoutController");

workoutRoutes.post("/add_workout",
    [
      helper_general.verifyToken,
      body("title")
          .notEmpty()
          .withMessage("Title is required")
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
        if(req.body.image_type_format !== 'base64'){
            let uploadedFile = req.files.image;
            if(uploadedFile.name !== ''){
                let fileExtension = uploadedFile.mimetype.split('/')[1];
                const allowedExtension = ["jpeg", "png", "jpg","gif"];
                if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                    throw new Error('File format is not allowed, use only jpeg and png.');
                }
            }
            else{
                throw new Error('Upload image is required.');
            }
        }
        else{
            if(req.body.image !== ''){
                let imageInfo = helper_image.getBase64ImageInfo(req.body.image);
                const allowedExtension = ["jpeg", "png", "jpg","gif"];
                if(allowedExtension.indexOf(imageInfo.extention.toLowerCase()) < 0){
                    throw new Error('File format is not allowed, use only jpeg and png.');
                }
            }
            else{
                throw new Error('Upload image is required.');
            }
        }
        return true;
        }),
      ],
      appWorkoutController.addWorkout
);
workoutRoutes.post("/add_exercise_into_workout",
    [
        helper_general.verifyToken,
        body("workout_id")
            .notEmpty()
            .isInt({ min:1})
            .withMessage("Workout id is required"),
        body("exercise_id")
            .notEmpty()
            .isInt({ min:1})
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
    appWorkoutController.addExerciseIntoWorkout
);

workoutRoutes.post("/remove_exercise_from_workout",
    [
        helper_general.verifyToken,
        body("id")
            .notEmpty()
            .isInt({ min:1})
            .withMessage("Id is required"),
    ],
    appWorkoutController.removeExerciseFromWorkout
);

workoutRoutes.post(
    "/reorder_workout_exercise",
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
    appWorkoutController.reorderWorkoutExercise
);

workoutRoutes.post(
    "/workout_exercise_rest_time",
    [
      helper_general.verifyToken,
      body("id")
      .notEmpty()
      .isInt({ min:1})
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
    appWorkoutController.workoutExerciseRestTime
);



workoutRoutes.post(
    "/get_workout_exercise_list",
    [
      helper_general.verifyToken,
      body("id")
      .notEmpty()
      .isInt({ min:1})
      .withMessage("Id is required"),
    ],
    appWorkoutController.getWorkoutExerciseList
);



workoutRoutes.post(
    "/get_workouts",
    [
      helper_general.verifyToken,
    ],
    appWorkoutController.getWorkouts
);

workoutRoutes.post(
    "/update_workout_exercise_duration",
    [
      helper_general.verifyToken,
    ],
    appWorkoutController.updateWorkoutExerciseDuration
);

workoutRoutes.post(
    "/get_workout_detail",
    [
        helper_general.verifyToken,
        body("id", "Invalid exercise id.")
            .notEmpty()
            .isInt({ min:1})
            .escape()
            .trim(),
    ],
    appWorkoutController.getWorkoutDetail
);

workoutRoutes.post(
    "/finish_workout",
    [
        helper_general.verifyToken,
        body("id", "Invalid workout id.")
            .notEmpty()
            .isInt({ min:1})
            .escape()
            .trim(),
    ],
    appWorkoutController.finishWorkout
);

workoutRoutes.post(
    "/archive_workout",
    [
        helper_general.verifyToken,
        body("id", "Invalid workout id.")
            .notEmpty()
            .escape()
            .trim(),
        body("action")
        .notEmpty()
        .withMessage("Action is required")
        .custom((value, {req})=>{
            const allowedAction = ["add","restore"];
            if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
                throw new Error('Only add and remove actions are allowed.');
            }
            return true;
        }),
    ],
    appWorkoutController.archiveWorkout
);

workoutRoutes.post(
    "/delete_workout",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appWorkoutController.deleteWorkout
);

workoutRoutes.post("/add_bulk_exercise_into_workout",
    [
        helper_general.verifyToken,
        body("workout_id")
            .notEmpty()
            .isInt({ min:1})
            .withMessage("Workout id is required."),
        body("exercises")
            .notEmpty()
            .withMessage("No exercises are found to add into the workout."),
    ],
    appWorkoutController.addBulkExerciseIntoWorkout
);

workoutRoutes.post("/get_unselected_exercises",
    [
        helper_general.verifyToken,
    ],
    appWorkoutController.getUnselectedExercises
);

workoutRoutes.post("/update_workout",
    [
      helper_general.verifyToken,
      body("id")
          .notEmpty()
          .isInt({ min:1})
          .withMessage("Workout Id is required")
          .escape()
          .trim(),
      body("title")
          .notEmpty()
          .withMessage("Title is required")
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
        if(req.body.image_type_format !== 'base64'){
            let uploadedFile = req.files.image;
            if(uploadedFile.name !== ''){
                let fileExtension = uploadedFile.mimetype.split('/')[1];
                const allowedExtension = ["jpeg", "png", "jpg","gif"];
                if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                    throw new Error('File format is not allowed, use only jpeg and png.');
                }
            }
        }
        else{
            if(req.body.image !== ''){
                let imageInfo = helper_image.getBase64ImageInfo(req.body.image);
                const allowedExtension = ["jpeg", "png", "jpg","gif"];
                if(allowedExtension.indexOf(imageInfo.extention.toLowerCase()) < 0){
                    throw new Error('File format is not allowed, use only jpeg and png.');
                }
            }
        }
        return true;
        }),
      ],
      appWorkoutController.updateWorkout
);




workoutRoutes.post(
    "/get_workout_exercise_detail",
    [
        helper_general.verifyToken,
        body("id", "Invalid id.")
            .notEmpty()
            .isInt({ min:1})
            .escape()
            .trim(),
    ],
    appWorkoutController.getWorkoutExerciseDetail
);
workoutRoutes.post("/update_workout_exercise_detail",
    [
        helper_general.verifyToken,
        body("workout_exercise_id")
            .notEmpty()
            .isInt({ min:1})
            .withMessage("Id is required")
            .escape()
            .trim(),
        body("workout_exercise_reps", "Invalid reps")
            .notEmpty()
            .escape()
            .isNumeric()
            .trim(),
        body("workout_exercise_sets", "Invalid sets")
            .notEmpty()
            .escape()
            .isNumeric()
            .trim(),
        body("workout_exercise_actual_duration", "Invalid duration")
            .notEmpty()
            .escape()
            .trim(),
      ],
      appWorkoutController.updateWorkoutExerciseDetail
);
module.exports = workoutRoutes;