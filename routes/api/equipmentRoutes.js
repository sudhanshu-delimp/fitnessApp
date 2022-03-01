const express = require('express');
const equipmentRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const appEquipmentController = require("../../controllers/api/appEquipmentController");

equipmentRoutes.post("/add_equipment",
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
            const allowedExtension = ["jpeg", "png", "jpg","gif"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          else{
            throw new Error('Upload image is required.');
          }
          return true;
      }),
    ],
    appEquipmentController.add_equipment
);

equipmentRoutes.post("/get-equipment-detail",
    [
    helper_general.verifyToken,
    body("id", "Invalid equipment id.")
        .notEmpty()
        .isInt({ min:1})
        .escape()
        .trim(),
    ],
    appEquipmentController.getEquipmentDetail
);

equipmentRoutes.post(
    "/update_equipment",
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
            const allowedExtension = ["jpeg", "png", "jpg","gif"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
          }
          return true;
      }),
    ],
    appEquipmentController.updateEquipment
);

equipmentRoutes.post(
    "/delete_equipment",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appEquipmentController.deleteEquipment
);

equipmentRoutes.post(
    "/get-equipment-listing",
    [
      helper_general.verifyToken
    ],
    appEquipmentController.getEquipmentListing
);

equipmentRoutes.post(
    "/get-equipment-related-exercises",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appEquipmentController.getEquipmentRelatedExercises
);

equipmentRoutes.post(
    "/bookmark_equipment",
    [
      helper_general.verifyToken,
      body("id")
      .notEmpty()
      .isInt({ min:1})
      .withMessage("Equipment id is required"),
      body("action")
      .notEmpty()
      .withMessage("Action is required")
      .custom(async (value, {req})=>{
            const allowedAction = ["add", "remove"];
            if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
                throw new Error('Only add and remove actions are allowed.');
            }
            if(req.body.id !== 0 && req.body.action === 'add'){
                var fields = {};
                fields['source_id = ?'] = req.body.id;
                fields['user_id = ?'] = req.user.id;
                await helper_general.bookmarkExist(fields).then(result=>{
                    if(result){
                        throw new Error('Already exist.');
                    }
                });
            }
            return true;
        }),
    ],
    appEquipmentController.bookmarkEquipment
);

equipmentRoutes.post(
    "/get_bookmark_equipments",
    [
      helper_general.verifyToken,
    ],
    appEquipmentController.getBookmarkEquipments
);
module.exports = equipmentRoutes;