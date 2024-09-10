const claimController = require("../controllers/claim.controllers")
const express =require("express")

const router = express.Router();


router.post('/create',claimController.createClaim )
router.get('/',claimController.getClaims )
router.patch('/approve/:id',claimController.approveClaim)
router.delete('/delete/:id', claimController.deleteClaim)
router.patch('/reject/:id', claimController.rejectClaim)
router.get('/:id', claimController.getClaimById)
router.post('/awardClaim/:id', claimController.awardClaim)
router.post('/awardGarage/:id', claimController.awardBidToGarage)
router.get('/awarded', claimController.getAwardedClaims)
router.get('/bids/:id', claimController.getBidsByClaim)
router.get('/assessed', claimController.garageFindsAssessedClaimsForRepair);
router.get('/assessed/:id', claimController.getAssessedClaimById);
// router.get('/assessed/repair/:id', claimController.getAssessedRepairClaimById);



module.exports = router;