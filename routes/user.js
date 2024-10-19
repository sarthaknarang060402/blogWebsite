const { Router } = require('express')
const { Post, Comment, User } = require('../db/index.js')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const commonMiddleware = require('../middleware/common')

const router = Router()

router.get('/', commonMiddleware, (req, res) => {
  res.send('Hello from the user home page!')
})

module.exports = router
