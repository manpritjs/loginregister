const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Access Denied: No Token Provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access Denied: Invalid Token Format');
  }

  // Use jwt.verify with a callback
  jwt.verify(token,  '111222', (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send('Access Denied: Token Expired');
      }
      return res.status(401).send('Access Denied: Invalid Token');
    }

    // Token is valid, attach the decoded userId to the request object
    req.userId = decoded.userId;
    next();
  });
};

module.exports = verifyToken;
