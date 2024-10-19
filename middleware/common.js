const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

function commonMiddleware(req, res, next) {
  const token = req.headers.authorization
  const words = token.split(' ')
  const jwtToken = words[1]

  const decodedValue = jwt.verify(jwtToken, jwtSecret)
  console.log(decodedValue)
  if (decodedValue.username) {
    req.access = decodedValue.access
    req.username = decodedValue.username
    next()
  } else {
    res.status(403).send('Unauthorized')
  }
}

module.exports = commonMiddleware
