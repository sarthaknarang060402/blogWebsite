function adminMiddleware(req, res, next) {
  if (req.access) {
    next()
  } else {
    res.status(403).send('Unauthorized')
  }
}

module.exports = adminMiddleware
