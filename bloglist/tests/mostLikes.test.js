const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = listHelper.blogsForTest()

const mostLiked = {
  author: 'Edsger W. Dijkstra',
  likes: 17
}

describe('most likes', () => {
  test('for a known list', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, mostLiked)
  })
})