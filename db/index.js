require('dotenv').config()
const mongoURI = process.env.MONGO_URI
const mongoose = require('mongoose')

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully')
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
  })

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
})

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true }, //sub-heading
  content: { type: String, required: true },
  tags: [String],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      voteType: { type: String },
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: null },
  author: { type: String, required: true },
})

const commentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  username: String,
  content: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      voteType: { type: String },
    },
  ],
  created_at: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)
const Post = mongoose.model('Post', postSchema)
const Comment = mongoose.model('Comment', commentSchema)

module.exports = {
  User,
  Post,
  Comment,
}
