const express =require("express")

const customer = require("./customer")
const claims = require("./claim.route")
const users = require("./users.route")
const auth = require("./auth.route")
const upload = require("./imageUploads.route")
const assessors = require("./assesor")
const garages = require("./garage.route")

const router = express.Router()


router.use("/customers", customer)
router.use("/claims", claims)
router.use("/users", users)
router.use("/auth", auth)
router.use("/images", upload)
router.use("/assessors", assessors)
router.use("/garages", garages)

module.exports  = router