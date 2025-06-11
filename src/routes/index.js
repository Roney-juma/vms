const express =require("express")
const auth = require("./auth.route")
const upload = require("./imageUploads.route")
const visitors = require("./visitor.route")
const logs = require("./log.route")
const users = require("./user.route")


const router = express.Router()


router.use("/auth", auth)
router.use("/images", upload)
router.use("/visitors", visitors)
router.use("/logs", logs)
router.use("/users", users)


module.exports  = router