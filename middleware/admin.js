const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

function adminMiddleware(req, res, next) {
  if (req.access) {
    next()
  } else {
    res.status(403).send('Unauthorized')
  }
}

module.exports = adminMiddleware
