const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Get token from Authorization header
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please login' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token using the secret
    req.user = decoded.id; // Add user id to the request
    next(); // Proceed to next middleware/route handler
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
