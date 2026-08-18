const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('total likes', () => {
    test('of empty list is zero', () => {
        assert.strictEqual(listHelper.totalLikes([]), 0)
    })

    test('when list has only one blog equals the likes of that', () => {
        assert.strictEqual(listHelper.totalLikes([66]), 66)
    })

    test('of a bigger list is calculated right', () => {
        assert.strictEqual(listHelper.totalLikes([1, 2, 3, 4, 6]), 16)
    })
})