const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

describe('blogs API with initially some blogs added', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    await User.insertMany(helper.initialUsers)
    const users = await helper.usersInDb()
    const blogs = helper.initialBlogs.map(blog => { return { ...blog, user: users[0].id } })
    await Blog.insertMany(blogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs fron the databases', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)
    assert(titles.includes(helper.initialBlogs[0].title))
  })

  test('blogs have property id instead of _id', async () => {
    const blogs = await helper.blogsInDb()
    assert.strictEqual(Array.isArray(blogs), true)
    assert.ok(blogs[0].id)
    assert.strictEqual(blogs[0]._id, undefined)
  })

  describe('viewing a specifig blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const specificBlog = blogsAtStart[0]
      const resultBlog = await api
        .get(`/api/blogs/${specificBlog.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.strictEqual(resultBlog.body.id, specificBlog.id)
      assert.strictEqual(resultBlog.body.title, specificBlog.title)
      assert.strictEqual(resultBlog.body.user.id, specificBlog.user.toString())
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('a valid blog with a proper JWT authorization can be added', async () => {
      const user = await User.findOne({ username: helper.initialUsers[0].username })
      const { token } = helper.artificialLogin(user)

      const newBlog = {
        title: 'A super mega fancy blog.',
        author: 'Jorge',
        url: 'https://supermegafancyblog.com',
        likes: 5432
      }
      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes(newBlog.title))
    })

    test('a blog without likes can be added with default value', async () => {
      const user = await User.findOne({ username: helper.initialUsers[0].username })
      const { token } = helper.artificialLogin(user)

      const newBlog = {
        title: 'No very liked blog',
        author: 'Carlos',
        url: 'https://unpopular.com',
      }
      const addedBlog = await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      assert.strictEqual(addedBlog.body.likes, 0)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes(newBlog.title))
    })

    test('a blog without JWT authentication fails with status code 401', async () => {
      const newBlog = {
        title: 'A super mega fancy blog.',
        author: 'Jorge',
        url: 'https://supermegafancyblog.com',
        likes: 5432
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without title is not added, fails with 400', async () => {
      const user = await User.findOne({ username: helper.initialUsers[0].username })
      const { token } = helper.artificialLogin(user)

      const newBlog = {
        author: 'Andres',
        url: 'http://insecureandrew.com',
        likes: 4875
      }
      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(newBlog)
        .expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without url is not added, fails with 400', async () => {
      const user = await User.findOne({ username: helper.initialUsers[0].username })
      const { token } = helper.artificialLogin(user)

      const newBlog = {
        title: 'Missing URL',
        author: 'Andres',
        likes: 4875
      }
      await api
        .post('/api/blogs')
        .auth(token, { type: 'bearer' })
        .send(newBlog)
        .expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid and with a proper JWT authorization', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      const user = await User.findById(blogToDelete.user)
      const { token } = helper.artificialLogin(user)

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .auth(token, { type: 'bearer' })
        .expect(204)
      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

    test('fails with status code 401 without a proper JWT authorization', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)
      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      const users = await helper.usersInDb()
      const user = await User.findById(users[1].id)
      const { token } = helper.artificialLogin(user)

      await api
        .delete(`/api/blogs/${invalidId}`)
        .auth(token, { type: 'bearer' })
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistingId = await helper.nonExistingId()

      const users = await helper.usersInDb()
      const user = await User.findById(users[1].id)
      const { token } = helper.artificialLogin(user)

      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .auth(token, { type: 'bearer' })
        .expect(404)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid and a proper body', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const selectedBlog = blogsAtStart[0]
      const blogToUpdate = {
        title: selectedBlog.title,
        author: selectedBlog.author,
        url: selectedBlog.url,
        likes: selectedBlog.likes + 1,
      }
      await api
        .put(`/api/blogs/${selectedBlog.id}`)
        .send(blogToUpdate)
        .expect(200)
      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(b => b.id === selectedBlog.id)
      assert.strictEqual(updatedBlog.likes, blogToUpdate.likes)
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      const blogToUpdate = {
        title: 'A super mega fancy blog.',
        author: 'Jorge',
        url: 'https://supermegafancyblog.com',
        likes: 5432,
      }
      await api
        .put(`/api/blogs/${invalidId}`)
        .send(blogToUpdate)
        .expect(400)
    })

    test('fails with status code 404 if id does not exist', async () => {
      const nonExistingId = await helper.nonExistingId()
      const blogToUpdate = {
        title: 'A super mega fancy blog.',
        author: 'Jorge',
        url: 'https://supermegafancyblog.com',
        likes: 5432,
      }
      await api
        .put(`/api/blogs/${nonExistingId}`)
        .send(blogToUpdate)
        .expect(404)
    })

    test('fails with status code 400 if the body of the update is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const selectedBlog = blogsAtStart[0]
      const blogToUpdate = {
        title: '',
        author: selectedBlog.author,
        url: '',
        likes: selectedBlog.likes + 1,
      }
      await api
        .put(`/api/blogs/${selectedBlog.id}`)
        .send(blogToUpdate)
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})