const express =require("express")
const auth = require("./auth.route")
const upload = require("./imageUploads.route")


const router = express.Router()


router.use("/auth", auth)
router.use("/images", upload)


module.exports  = router