const { Router } = require('express')
const { Post, Comment } = require('../db/index.js')
const commonMiddleware = require('../middleware/common')
const adminMiddleware = require('../middleware/admin')
const router = Router()

router.get('/', commonMiddleware, adminMiddleware, (req, res) => {
  res.send('Hello from the Admin home page!')
})

//post a blog
router.post('/blog', commonMiddleware, adminMiddleware, async (req, res) => {
  const title = req.body.title
  const slug = req.body.slug
  const content = req.body.content
  const tags = req.body.tags
  const author = req.username

  const newPost = await Post.create({
    title: title,
    content: content,
    slug: slug,
    tags: tags,
    author: author,
    likes: 0,
    dislikes: 0,
    comments: [],
    votes: [],
    created_at: Date.now(),
    updated_at: null,
  })

  if (newPost) {
    res.status(200).json({ message: 'New blog posted', newPost })
  } else {
    res.status(500).send('Error posting blog')
  }
})

//update a blog...
router.put(
  '/blogs/:id',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {
    const title = req.body.title
    const slug = req.body.slug
    const content = req.body.content
    const tags = req.body.tags

    const blogId = req.params.id
    const post = await Post.findById(blogId)
    if (!post) {
      return res.status(400).json({ message: 'Blog not found' })
    }

    const author = post.author
    const created_at = post.created_at
    const likes = post.likes
    const dislikes = post.dislikes
    const comments = post.comments
    const votes = post.votes

    const updatedPost = await Post.findByIdAndUpdate(
      blogId,
      {
        title: title,
        content: content,
        slug: slug,
        tags: tags,
        author: author,
        likes: likes,
        dislikes: dislikes,
        comments: comments,
        votes: votes,
        created_at: created_at,
        updated_at: Date.now(),
      },
      { new: true }
    )

    if (updatedPost) {
      res
        .status(200)
        .json({ message: 'Blog updated Successfully', updatedPost })
    } else {
      res.status(500).send('Error updating blog')
    }
  }
)

//delete all blogs
router.delete('/blogs', commonMiddleware, adminMiddleware, async (req, res) => {
  const areDeleted = await Post.deleteMany({})
  if (areDeleted) {
    res.status(200).json({ message: 'Blogs deleted successfully' })
  } else {
    res.status(500).send('Error deleting blogs')
  }
})

//delete one blog
router.delete(
  '/blogs/:id',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {
    const blogId = req.params.id
    const isdeleted = await Post.deleteOne({ _id: blogId })
    if (isdeleted) {
      res.status(200).json({ message: 'Blog deleted successfully' })
    } else {
      res.status(500).send('Error deleting blog')
    }
  }
)

//delete a comment from a blog
router.delete(
  '/blogs/:id/comments/:commentId',
  commonMiddleware,
  adminMiddleware,
  async (req, res) => {
    const blogId = req.params.id
    const post = await Post.findById(blogId)
    const commentId = req.params.commentId
    const comment = await Comment.findById(commentId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    }
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' })
    }
    if (!req.access) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this comment.' })
    }
    const isdeleted = await Comment.deleteOne({ _id: commentId })
    if (isdeleted) {
      post.comments = post.comments.filter((comment) => {
        return comment.toString() !== commentId.toString()
      }) // delete from comments array of blog too
      post.save()
      res.status(200).json({ message: 'Comment deleted successfully' })
    } else {
      res.status(500).send('Error deleting blog')
    }
  }
)

module.exports = router
