const garageController = require("../controllers/garage.controller")
const express =require("express")

const router = express.Router();

router.post('/login',garageController.login)
router.post('/reset-password', garageController.resetPassword);
router.post('/create',garageController.createGarage)
router.get('/',garageController.getAllGarages)
router.get('/assessedClaims',garageController.getAssessedClaims)
router.delete('/delete/:garageId', garageController.deleteGarage)
router.get('/:id', garageController.getGarage)
router.put('/:id',garageController.updateGarage)
router.post('/bidClaim/:id',garageController.placeBid)
router.post('/completeJob/:id',garageController.completeRepair)
router.get('/myBids/:garageId',garageController.getGarageBids)

module.exports = router;