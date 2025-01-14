const Blog = require('../models/blog')

const initialBlogs = [
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
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'babidibubidipum', author: 'genius.' })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}
