const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const assert = require('assert')

const api = supertest(app)

describe('when there is initially some users inside', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        let blogObject = new User(helper.initialUsers[0])
        await blogObject.save()
        blogObject = new User(helper.initialUsers[1])
        await blogObject.save()
    })

    test('all users are returned', async () => {
        const blogs = await helper.blogsInDb()

        assert.strictEqual(blogs.length, helper.initialBlogs.length)
    })

    describe('addition of new user', () => {
            
        test('a user can be added', async () => {
            const newUser = {
                _id: '6a9055b7f5236184837b0c70',
                username: "abangabangan",
                passwordHash: "$2b$1dd0$7jP1ktwASZ2E.mQXDvI4I.Wh//VIcIUnqWum0eY.zrgbOK7w4FII6",
                name: "domo",
                blogs: [],
                __v: 0
            }

            await api
            .post('/api/blogs')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
            
            const usernames = usersAtEnd.map(r => r.username)
            assert(usernames.includes('abangabangan'))
        })
    })
})