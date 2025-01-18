const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

describe('blogs API with initially some blogs added', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
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
      assert.deepStrictEqual(resultBlog.body, specificBlog)
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

    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'A super mega fancy blog.',
        author: 'Jorge',
        url: 'https://supermegafancyblog.com',
        likes: 5432,
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes(newBlog.title))
    })

    test('a blog without likes can be added with default value', async () => {
      const newBlog = {
        title: 'No very liked blog',
        author: 'Carlos',
        url: 'https://unpopular.com',
      }
      const addedBlog = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      assert.strictEqual(addedBlog.body.likes, 0)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes(newBlog.title))
    })

    test('blog without title is not added, fails with 400', async () => {
      const newBlog = {
        author: 'Andres',
        url: 'http://insecureandrew.com',
        likes: 4875
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without url is not added, fails with 400', async () => {
      const newBlog = {
        title: 'Missing URL',
        author: 'Andres',
        likes: 4875
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })


  describe('deletion of a blog', () => {

    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .delete(`/api/blogs/${nonExistingId}`)
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