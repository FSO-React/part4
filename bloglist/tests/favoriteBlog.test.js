const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = listHelper.blogsForTest()

const knownMostLiked =  {
  title: 'The biggest tragedy',
  author: 'Manuel Belgrano',
  likes: 26062011
}
const mostLiked = blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)

describe('favorite blog', () => {
  test('for a known blog on the list', () => {
    const result = listHelper.favoriteBlog(blogs.concat(knownMostLiked))
    assert.deepStrictEqual(result, knownMostLiked)
  })

  test('from the list', () => {
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, mostLiked)
  })
})