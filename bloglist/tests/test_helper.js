const Blog = require('../models/blog')
const User = require('../models/user')

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

const initialUsers = [
  {
    'username': 'firstuser',
    'name': 'Firstefon',
    'password': 'f1234',
  },
  {
    'username': 'seconduser',
    'name': 'Secondtron',
    'password': 's1234',
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'babidibubidipum', author: 'genius.', url: 'https://necesaryurl.com' })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const nonExistingIdUsers = async () => {
  const user = new User({ username: 'nonexistinguser', name: 'Non Existing', password: '1234' })
  await user.save()
  await user.deleteOne()
  return user._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, nonExistingId, nonExistingIdUsers, blogsInDb, usersInDb
}
