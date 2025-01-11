const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const { randomInt } = require('node:crypto')

const blogs = listHelper.blogsForTest()

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  const oneBlog = blogs[randomInt(blogs.length)]
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes([ oneBlog ])
    assert.strictEqual(result, oneBlog.likes)
  })

  const sum = blogs.reduce((sum, blog) => sum + blog.likes, 0)
  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, sum)
  })
})