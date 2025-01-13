const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogs = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogs.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('blogs API', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are three blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'A super mega fancy blog.',
      author: true,
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

  test('blog without title is not added', async () => {
    const newBlog = {
      likes: 4875
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('blog without author is not added', async () => {
    const newBlog = {
      likes: 4875
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('a blog can be deleted', async () => {
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

  after(async () => {
    await mongoose.connection.close()
  })
})