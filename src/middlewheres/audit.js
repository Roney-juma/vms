const AuditLog = require('./models/AuditLog'); 

const logAudit = async (action, collectionName, documentId, changes = {}, userId = null) => {

  try {
    const auditLog = new AuditLog({
      action,
      collectionName,
      documentId,
      changes,
      userId,
    });
    await auditLog.save();
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}

module.exports = logAudit;