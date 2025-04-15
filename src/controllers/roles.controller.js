const roleService = require('../service/roles.service');
const logger = require('../middlewheres/logger');

const createRole = async (req, res) => {
    try {
        const roleData = req.body;
        const newRole = await roleService.createRole(roleData);
        res.status(201).json(newRole);
    } catch (error) {
        logger.error('Error creating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        logger.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getRoleById = async (req, res) => {
    try {
        const roleId = req.params.id;
        const roleData = await roleService.getRoleById(roleId);
        res.status(200).json(roleData);
    } catch (error) {
        logger.error('Error fetching role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const updateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const roleData = req.body;
        const updatedRole = await roleService.updateRole(roleId, roleData);
        res.status(200).json(updatedRole);
    }
    catch (error) {
        logger.error('Error updating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const deletedRole = await roleService.deleteRole(roleId);
        res.status(200).json(deletedRole);
    }
    catch (error) {
        logger.error('Error deleting role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getRolesByPermission = async (req, res) => {
    try {
        const permission = req.params.permission;
        const roles = await roleService.getRolesByPermission(permission);
        res.status(200).json(roles);
    }
    catch (error) {
        logger.error('Error fetching roles by permission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getRolesByIds = async (req, res) => {
    try {
        const ids = req.params.ids;
        const roleIds = ids.split(',').map(id => id.trim());
        const roles = await roleService.getRolesByIds(roleIds);
        res.status(200).json(roles);
    }
    catch (error) {
        logger.error('Error fetching roles by IDs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getRolesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const roles = await roleService.getRolesByUserId(userId);
        res.status(200).json(roles);
    }
    catch (error) {
        logger.error('Error fetching roles by user ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getRoleByName = async (req, res) => {
    try {
        const roleName = req.params.name;
        const roleData = await roleService.getRoleByName(roleName);
        res.status(200).json(roleData);
    }
    catch (error) {
        logger.error('Error fetching role by name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createBulkRoles = async (req, res) => {
    try {
        const roles = req.body.roles;
        const createdRoles = await roleService.createBulkRoles(roles);
        res.status(201).json(createdRoles);
    }
    catch (error) {
        logger.error('Error creating bulk roles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getRolesByPermission,
    getRolesByIds,
    getRolesByUserId,
    getRoleByName,
    createBulkRoles
    };

