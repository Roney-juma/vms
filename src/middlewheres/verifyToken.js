const jwtDecode = require('jwt-decode');
// const { Role } = require("../models")
const { User } = require("../models")
// const logger = require('../middlewares/loggers');

async function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    logger.info(`No Token Provided`);
    return res.status(403).send({ message: 'No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwtDecode(token);
    // Check if the token is expired
    if (Date.now() >= decoded.exp * 1000) {
      logger.info(`Token Expired`);
      return res.status(401).send({ message: 'Token expired.' });
    }
    const role = await Role.findById(decoded.role_id).select('role_name').exec();
    const user = await User.findById(decoded._id).select('first_name last_name _id').exec();
    req.userId = decoded._id;
    req.user =user
    // req.roleName = role.role_name;
    // req.userName = user.first_name;
    next();
  } catch (err) {
    logger.error(`Unauthorized - ${err}`);
    return res.status(401).send({ message: 'Unauthorized.' });
  }
}

module.exports = verifyToken;