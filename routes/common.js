const { Router } = require('express')
const bcrypt = require('bcrypt')
const { Post, Comment, User } = require('../db/index.js')
const jwt = require('jsonwebtoken')
const commonMiddleware = require('../middleware/common')
const jwtSecret = process.env.JWT_SECRET

const router = Router()
const saltRounds = 10

router.get('/', (req, res) => {
  res.send('Hello from the Common Home page!')
})

//register
router.post('/register', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const email = req.body.email
  let isAdmin = false

  if (req.body.isAdmin) {
    isAdmin = req.body.isAdmin
  }

  if (!username || !email || !password) {
    return res
      .status(403)
      .json({ error: 'Please enter all the required details to register' })
  }

  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    return res.status(403).send('Username already exists, please use another')
  }

  if (password.length < 6) {
    return res.status(403).json({
      error: 'Password must be at least 6 characters long',
    })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res
      .status(403)
      .send('This email is already registered. Try logging in.')
  }

  const salt = await bcrypt.genSalt(saltRounds)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = await User.create({
    username: username,
    password: hashedPassword,
    email: email,
    isAdmin: isAdmin,
  })

  if (newUser) {
    const token = jwt.sign(
      { username: newUser.username, access: user.isAdmin, userId: newUser._id },
      jwtSecret
    )
    if (isAdmin) {
      return res
        .status(200)
        .json({ message: 'Admin created successfully', token })
    } else {
      return res
        .status(200)
        .json({ message: 'User created successfully', token })
    }
  } else {
    return res.status(500).send('Error registering user')
  }
})

//login
router.post('/login', async (req, res) => {
  const input = req.body.input // username or email
  const password = req.body.password

  if (!input || !password) {
    return res
      .status(403)
      .json({ error: 'Please enter username/email and password.' })
  }

  const user = await User.findOne({
    $or: [{ username: input }, { email: input }],
  })

  if (!user) {
    return res.status(400).json({ error: 'User not found' })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    return res.status(400).json({ error: 'Incorrect password' })
  }

  const token = jwt.sign(
    { username: user.username, access: user.isAdmin, userId: user._id },
    jwtSecret
  )
  return res.status(200).json({ message: 'Logged in successfully', token })
})

//get all blogs
router.get('/blogs', commonMiddleware, async (req, res) => {
  const posts = await Post.find({})
  return res.json(posts)
})

//get comments on a blog
router.get('/blogs/:id/comments', commonMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) {
    return res.status(404).json({ message: 'Post not found' })
  }
  const commentsArray = post.comments
  const comments = await Comment.find({ _id: { $in: commentsArray } })

  if (!comments.length) {
    return res.json({ message: 'Comments not found' })
  } else {
    return res.json(comments)
  }
})

//get a single blog
router.get('/blogs/:id', commonMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) {
    return res.status(404).json({ message: 'Post not found' })
  }
  return res.json(post)
})

module.exports = router
