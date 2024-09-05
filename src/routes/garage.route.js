const garageController = require("../controllers/garage.controller")
const express =require("express")

const router = express.Router();


router.post('/create',garageController.createGarage)
router.get('/',garageController.getAllGarages)
router.delete('/delete/:id', garageController.deleteGarage)
router.get('/:id', garageController.getGarage)
router.put('/:id',garageController.updateGarage)

module.exports = router;