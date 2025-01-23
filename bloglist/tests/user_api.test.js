const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

describe('users API with initially some users added', () => {

  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, helper.initialUsers.length)
  })

  test('a specific user is within the returned users fron the databases', async () => {
    const response = await api.get('/api/users')
    const usernames = response.body.map(u => u.username)
    assert(usernames.includes(helper.initialUsers[0].username))
  })

  test('users have property id instead of _id', async () => {
    const users = await helper.usersInDb()
    assert.strictEqual(Array.isArray(users), true)
    assert.ok(users[0].id)
    assert.strictEqual(users[0]._id, undefined)
  })

  test('users dont have property password or passwordHash', async () => {
    const users = await helper.usersInDb()
    assert.strictEqual(Array.isArray(users), true)
    assert.strictEqual(users[0].password, undefined)
    assert.strictEqual(users[0].passwordHash, undefined)
  })

  describe('viewing a specifig user', () => {

    test('succeeds with a valid id', async () => {
      const usersAtStart = await helper.usersInDb()
      const specificUser = usersAtStart[0]
      const resultUser = await api
        .get(`/api/users/${specificUser.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      assert.deepStrictEqual(resultUser.body, specificUser)
    })

    test('fails with statuscode 404 if user does not exist', async () => {
      const validNonexistingId = await helper.nonExistingIdUsers()
      await api
        .get(`/api/users/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api
        .get(`/api/users/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new user', () => {

    test('a valid user can be added with status code 201', async () => {
      const newUser = {
        username: 'jorge',
        name: 'Jorge',
        password: '12345678',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('a user without name can be added with status code 201', async () => {
      const newUser = {
        username: 'carlos',
        password: '12345678',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('user without username is not added, fails with status code 400', async () => {
      const newUser = {
        name: 'Andres',
        password: '12345678',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('user without password is not added, fails with status code 400', async () => {
      const newUser = {
        username: 'jorge',
        name: 'Jorge',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('user with username and password shorter tha 3 digits is not added, fails with status code 400', async () => {
      const newUser = {
        username: 'aa',
        password: '12',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })
  })

})

after(async () => {
  await mongoose.connection.close()
})