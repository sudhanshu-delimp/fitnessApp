const express = require('express');
const videoRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const appVideoController = require("../../controllers/api/appVideoController");

videoRoutes.post(
    "/upload-video",
    [
      helper_general.verifyToken,
      body("title", "The title must be of minimum 3 characters length")
          .notEmpty()
          .escape()
          .trim(),
      body("source_id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
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
            const allowedExtension = ["jpeg", "png", "jpg","gif"];
            if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                throw new Error('Thumb image File format is not allowed, use only jpeg and png.');
            }
        }
        else{
          throw new Error('Upload Thumb image is required.');
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
        throw new Error('Upload Video is required.');
    }
    return true;
    }),
    ],
    appVideoController.uploadVideo
);

videoRoutes.post(
    "/delete_video",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appVideoController.deleteVideo
);

videoRoutes.post(
    "/update_video",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
      body("thumb_image").custom((value, { req })=>{

        if(req.files !== null && req.files.thumb_image!==undefined){
          let uploadedFile = req.files.thumb_image;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
            const allowedExtension = ["jpeg", "png", "jpg","gif"];
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
    appVideoController.updateVideo
);

videoRoutes.post(
    "/get-equipment-related-videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appVideoController.getEquipmentRelatedVideos
);

videoRoutes.post(
    "/get-exercise-related-videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appVideoController.getExerciseRelatedVideos
);

videoRoutes.post(
    "/delete_videos",
    [
      helper_general.verifyToken,
      body("id", "Invalid id.")
      .notEmpty()
      .isInt({ min:1})
      .escape()
      .trim(),
    ],
    appVideoController.deleteVideos
);
module.exports = videoRoutes;