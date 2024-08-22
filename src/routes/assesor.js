const assesorController = require("../controllers/assessor.controller")
const express =require("express")

const router = express.Router();


router.post('/create',assesorController.createAssessor)
router.get('/',assesorController.getAllAssessors )
router.get('/approvedClaims',assesorController.getApprovedClaims)
router.delete('/delete/:id', assesorController.deleteAssessor)
router.get('/:id', assesorController.getAssessorById)
router.post('/bid/:id',assesorController.placeBid)
router.put('/:id',assesorController.updateAssessor)

module.exports = router;