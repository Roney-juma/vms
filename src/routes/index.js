const express =require("express")

const providers = require("./providers.route")
const emergencies = require("./emergencies.route")
const users = require("./users.route")
const auth = require("./auth.route")
const upload = require("./imageUploads.route")
const services = require("./services.route")
const communications = require("./communications.route")
const admin = require("./admin.route")
const roles = require("./roles.route")


const router = express.Router()


router.use("/providers", providers)
router.use("/emergencies", emergencies)
router.use("/users", users)
router.use("/auth", auth)
router.use("/images", upload)
router.use("/services", services)
router.use("/communications", communications)
router.use("/roles", roles)


module.exports  = router