const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please login' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token using the secret
    req.user = decoded; // Add user id to the request
    next(); // Proceed to next middleware/route handler
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
