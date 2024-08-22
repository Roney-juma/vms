const express = require("express");
const imagesController = require("../controllers/uploadpics.controller")
const Upload = require('../utils/upload')
const router = express.Router();


router.post('/upload', Upload.single('image'), imagesController.imageUpload);


module.exports = router;