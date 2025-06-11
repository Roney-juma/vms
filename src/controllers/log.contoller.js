const Log = require('../models/logs.model');

// Get all logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('visitor')
      .populate('performedBy')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get logs for a specific visitor
exports.getVisitorLogs = async (req, res) => {
  try {
    const logs = await Log.find({ visitor: req.params.visitorId })
      .populate('performedBy')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get logs by date range
exports.getLogsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const logs = await Log.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('visitor')
    .populate('performedBy')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};