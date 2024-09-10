const garageController = require("../controllers/garage.controller")
const express =require("express")

const router = express.Router();

router.post('/login',garageController.login)
router.post('/create',garageController.createGarage)
router.get('/',garageController.getAllGarages)
router.get('/assessedClaims',garageController.getAssessedClaims)
router.delete('/delete/:id', garageController.deleteGarage)
router.get('/:id', garageController.getGarage)
router.put('/:id',garageController.updateGarage)
router.post('/bidClaim/:id',garageController.placeBid)

module.exports = router;