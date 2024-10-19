const express = require('express')
const bodyParser = require('body-parser')
const adminRouter = require('./routes/admin')
const commonRouter = require('./routes/common')
const userRouter = require('./routes/user')

const app = express()

app.use(bodyParser.json())
app.use('/', commonRouter)
app.use('/admin', adminRouter)
app.use('/user', userRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
