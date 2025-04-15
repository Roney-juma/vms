const role = require('../models/roles.model');
const logger = require('../middlewheres/logger');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const createRole = async (roleData) => {
    try {
        const newRole = new role(roleData);
        await newRole.save();
        return newRole;
    } catch (error) {
        logger.error('Error creating role:', error);
        throw error;
    }
    }
const getAllRoles = async () => {
    try {
        const roles = await role.find();
        return roles;
    } catch (error) {
        logger.error('Error fetching roles:', error);
        throw error;
    }
}
const getRoleById = async (roleId) => {
    try {
        const roleData = await role.findById(roleId);
        if (!roleData) {
            throw new Error('Role not found');
        }
        return roleData;
    } catch (error) {
        logger.error('Error fetching role:', error);
        throw error;
    }
}
const updateRole = async (roleId, roleData) => {
    try {
        const updatedRole = await role.findByIdAndUpdate(roleId, roleData, { new: true });
        if (!updatedRole) {
            throw new Error('Role not found');
        }
        return updatedRole;
    } catch (error) {
        logger.error('Error updating role:', error);
        throw error;
    }
}
const deleteRole = async (roleId) => {
    try {
        const deletedRole = await role.findByIdAndDelete(roleId);
        if (!deletedRole) {
            throw new Error('Role not found');
        }
        return deletedRole;
    } catch (error) {
        logger.error('Error deleting role:', error);
        throw error;
    }
}
const getRoleByName = async (roleName) => {
    try {
        const roleData = await role.findOne({ name: roleName });
        if (!roleData) {
            throw new Error('Role not found');
        }
        return roleData;
    } catch (error) {
        logger.error('Error fetching role:', error);
        throw error;
    }
}
const getRolesByIds = async (roleIds) => {
    try {
        const roles = await role.find({ _id: { $in: roleIds.map(id => ObjectId(id)) } });
        return roles;
    } catch (error) {
        logger.error('Error fetching roles:', error);
        throw error;
    }
}
const getRolesByUserId = async (userId) => {
    try {
        const roles = await role.find({ users: userId });
        return roles;
    } catch (error) {
        logger.error('Error fetching roles:', error);
        throw error;
    }
}
const getRolesByPermission = async (permission) => {
    try {
        const roles = await role.find({ permissions: permission });
        return roles;
    } catch (error) {
        logger.error('Error fetching roles:', error);
        throw error;
    }
}

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getRoleByName,
    getRolesByIds,
    getRolesByUserId,
    getRolesByPermission
};