const Visitor = require('../models/visitor.model');
const Log = require('../models/logs.model');

// Register a new visitor
exports.registerVisitor = async (req, res) => {
  try {
    const { name, email, phone, host, purpose, company, idType, idNumber } = req.body;
    
    const visitor = new Visitor({
      name,
      email,
      phone,
      host,
      purpose,
      company,
      idType,
      idNumber,
      image: req.file ? req.file.path : undefined
    });

    await visitor.save();
    console.log('Visitor registered:', visitor);

    // Log the action
    const log = new Log({
      visitor: visitor._id,
      action: 'check-in',
      details: req.body,
      performedBy: '6849486ae373cf5d76ee736f'
    });
    await log.save();

    res.status(201).json({
      success: true,
      data: visitor
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Check out a visitor
exports.checkOutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    if (visitor.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Visitor already checked out'
      });
    }

    visitor.status = 'checked-out';
    visitor.checkOut = Date.now();
    await visitor.save();

    // Log the action
    const log = new Log({
      visitor: visitor._id,
      action: 'check-out',
      details: { checkOutTime: visitor.checkOut },
      performedBy: req.user.id
    });
    await log.save();

    res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get all visitors
exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate('host');
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get current visitors (checked-in)
exports.getCurrentVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ status: 'checked-in' }).populate('host');
    res.status(200).json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get visitor by ID
exports.getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('host');
    
    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Update visitor details
exports.updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    // Log the action
    const log = new Log({
      visitor: visitor._id,
      action: 'update',
      details: req.body,
      performedBy: req.user.id
    });
    await log.save();

    res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};