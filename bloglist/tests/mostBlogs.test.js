const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = listHelper.blogsForTest()

const mostBlogs = {
  author: 'Robert C. Martin',
  blogs: 3
}

describe('most blogs', () => {
  test('for a known list', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, mostBlogs)
  })
})