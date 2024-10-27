const { Router } = require('express')
const { Post, Comment } = require('../db/index.js')
const commonMiddleware = require('../middleware/common')

const router = Router()

router.get('/', commonMiddleware, (req, res) => {
  res.send('Hello from the user home page!')
})

//comment a blog
router.post('/blog/:id/comment', commonMiddleware, async (req, res) => {
  const blogId = req.params.id
  const comment = req.body.comment
  const author = req.username
  if (!comment || !author) {
    return res.status(400).json({ message: 'Comment and author are required.' })
  }

  const post = await Post.findById(blogId)
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' })
  }

  const newComment = await Comment.create({
    post_id: blogId,
    username: author,
    content: comment,
    created_at: Date.now(),
  })

  if (newComment) {
    post.comments.push(newComment)
    post.save()
    res.status(200).json({ message: 'New comment posted', newComment })
  } else {
    res.status(500).send('Error posting comment')
  }
})

//update a comment
router.put(
  '/blog/:id/comments/:commentId',
  commonMiddleware,
  async (req, res) => {
    const blogId = req.params.id
    const commentId = req.params.commentId
    const newComment = req.body.comment
    const commenter = req.username

    if (!newComment || !author) {
      return res
        .status(400)
        .json({ message: 'Comment and author are required.' })
    }

    const post = await Post.findById(blogId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' })
    }

    // chheck author is the same as commenter
    if (comment.username !== commenter) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to update this comment.' })
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content: newComment, created_at: Date.now() },
      { new: true } // returns the updated document, no need to comment.save
    )

    if (updatedComment) {
      res.status(200).json({ message: 'Comment updated', updatedComment })
    } else {
      res.status(500).send('Error updating comment')
    }
  }
)

//delete comment
router.delete(
  '/blog/:id/comments/:commentId',
  commonMiddleware,
  async (req, res) => {
    const blogId = req.params.id
    const post = await Post.findById(blogId)
    const commentId = req.params.commentId // string
    const comment = await Comment.findById(commentId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    }
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' })
    }
    if (comment.username !== req.username) {
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
      res.status(200).json({ message: 'Blog deleted successfully' })
    } else {
      res.status(500).send('Error deleting blog')
    }
  }
)

//rate a blog
router.post('/blog/:id/rate', commonMiddleware, async (req, res) => {
  const blogId = req.params.id
  const voteType = req.body.voteType
  const post = await Post.findById(blogId)
  const userId = req.userId
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' })
  }

  const existingVote = post.votes.find((vote) => vote.userId === userId)
  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // User is toggling off the same vote
      post.votes = post.votes.filter((vote) => vote.userId !== userId) // remove vote from votes

      if (voteType === 'upvote') {
        // if togged is upvote or downvote, we remove respective rating
        post.likes -= 1
      } else if (voteType === 'downvote') {
        post.dislikes -= 1
      }
    } else {
      // changed vote from up to down or down to up
      if (voteType === 'upvote') {
        post.likes += 1
        post.dislikes -= 1
      } else if (voteType === 'downvote') {
        post.dislikes += 1
        post.likes -= 1
      }
      existingVote.voteType = voteType // update the vote type
    }
    await post.save() // must do this to save the changes
    return res.status(200).json({ message: 'Vote updated', post })
  }

  const newVote = { userId, voteType }
  const voted = post.votes.push(newVote)
  if (voted) {
    if (voteType === 'upvote') {
      post.likes += 1
    } else if (voteType === 'downvote') {
      post.dislikes += 1
    }
    post.save()
    res.status(200).json({ message: 'New rating added', post })
  } else {
    res.status(500).send('Error rating post')
  }
})

//rate a comment
router.post(
  '/blog/:id/comments/:commentId/rate',
  commonMiddleware,
  async (req, res) => {
    const blogId = req.params.id
    const voteType = req.body.voteType
    const post = await Post.findById(blogId)
    const commentId = req.params.commentId
    const comment = await Comment.findById(commentId)
    const userId = req.userId
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    }
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' })
    }

    const existingVote = comment.votes.find((vote) => vote.userId === userId)

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User is toggling off the same vote
        comment.votes = comment.votes.filter((vote) => vote.userId !== userId) // remove vote  from votes
        if (voteType === 'upvote') {
          comment.likes -= 1
        } else if (voteType === 'downvote') {
          comment.dislikes -= 1
        }
      } else {
        if (voteType === 'upvote') {
          comment.likes += 1
          comment.dislikes -= 1
        } else if (voteType === 'downvote') {
          comment.dislikes += 1
          comment.likes -= 1
        }
        existingVote.voteType = voteType // update the vote type
      }
      await comment.save() // must do this to save the changes
      return res.status(200).json({ message: 'Vote updated', comment })
    }

    const newVote = { userId, voteType }
    const voted = comment.votes.push(newVote)
    if (voted) {
      if (voteType === 'upvote') {
        comment.likes += 1
      } else if (voteType === 'downvote') {
        comment.dislikes += 1
      }
      comment.save()
      res.status(200).json({ message: 'New rating added', comment })
    } else {
      res.status(500).send('Error rating comment')
    }
  }
)

module.exports = router
