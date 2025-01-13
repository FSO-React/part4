require('dotenv').config({ path: '.env' })
const mongoose = require('mongoose')
const Blog = require('./models/blog')

const MONGODB_URI = process.env.TEST_MONGODB_URI
mongoose.set('strictQuery',false)

mongoose.connect(MONGODB_URI)
console.log('connected to MongoDB')

const blogs = [
  {
    'title': 'My first blog',
    'author': 'John Doe',
    'url': 'http://www.johndoe.com',
    'likes': 10
  },
  {
    'title': 'Successful blog',
    'author': 'Alejandro Diaz Crivelli',
    'url': 'https://github.com/diazale16',
    'likes': 16112001
  }
]

// SAVE BLOG
const saveBlogs = async () => {
  const blogsToSave = blogs.map(blog => Blog(blog))
  const blogsPromises = blogsToSave.map(blog => blog.save())
  try {
    const result = await Promise.all(blogsPromises)
    console.log(result)
    console.log(' *** Closing connection ***')
    mongoose.connection.close()
  } catch (error) {
    console.error(error)
  }
}
saveBlogs()

// GET BLOGS
// Blog.find({}).then(result => {
//   result.forEach(blog => {
//     console.log(blog)
//   })
//   mongoose.connection.close()
// })