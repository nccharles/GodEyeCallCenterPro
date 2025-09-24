const express = require("express");
const {
    registerUser,
    loginUser,
    findUser,
    getUsers, getAllUsers,
} = require("../Controllers/userController");
const {raw} = require("body-parser");

const router = express.Router();

router.post("/register", raw({type: 'application/json'}), registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);
router.get("/all", getAllUsers);

module.exports = router;
