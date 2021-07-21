const router = require("express").Router();
const { body } = require("express-validator");
const {
    user_login,
    user_register,
    user_forgot_password,
} = require("./controllers/api/appUserController");

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
module.exports = router;
