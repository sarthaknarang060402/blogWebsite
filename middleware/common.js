const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

function commonMiddleware(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    res.status(403).send('Unauthorized')
  }
  const words = token.split(' ')
  const jwtToken = words[1]

  const decodedValue = jwt.verify(jwtToken, jwtSecret)
  if (decodedValue.username) {
    req.access = decodedValue.access
    req.username = decodedValue.username
    req.userId = decodedValue.userId
    next()
  } else {
    res.status(403).send('Unauthorized')
  }
}

module.exports = commonMiddleware
