// Routes for roles
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roles.controller');

// Create a new role
router.post('/', roleController.createRole);
// Get all roles
router.get('/', roleController.getAllRoles);
// Get a role by ID
router.get('/:id', roleController.getRoleById); 
// Update a role
router.put('/:id', roleController.updateRole); 
// Delete a role
router.delete('/:id', roleController.deleteRole); 
// Get roles by permission
router.get('/permissions/:permission', roleController.getRolesByPermission); 
// Get roles by name
router.get('/name/:name', roleController.getRoleByName); 
// Get roles by user ID
router.get('/user/:userId', roleController.getRolesByUserId);
// Get roles by IDs
router.get('/ids/:ids', roleController.getRolesByIds);
// Get roles by permission
router.get('/permissions/:permission', roleController.getRolesByPermission);
// Get roles by IDs
router.get('/ids/:ids', roleController.getRolesByIds);
// Get roles by user ID
router.get('/user/:userId', roleController.getRolesByUserId);
// Create bulk roles
router.post('/bulk', roleController.createBulkRoles);

// export the router
module.exports = router;
