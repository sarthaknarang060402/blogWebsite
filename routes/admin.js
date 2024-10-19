const { Router } = require('express')
const { Post, Comment, User } = require('../db/index.js')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const commonMiddleware = require('../middleware/common')
const adminMiddleware = require('../middleware/admin')
const router = Router()

router.get('/', commonMiddleware, adminMiddleware, (req, res) => {
  res.send('Hello from the Admin home page!')
})

router.get('/blogs', commonMiddleware, adminMiddleware, async (req, res) => {
  const posts = await Post.findAll()
  res.json(posts)
})

router.get('/blog:id', commonMiddleware, adminMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id)
  res.json(post)
})

router.post(
  '/postBlog',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {}
)
router.delete(
  '/delteBlog:id',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {}
)
router.put(
  '/updateBlog:id',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {}
)
router.delete(
  'deleteBlogs',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {}
)

module.exports = router
