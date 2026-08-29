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

        await Promise.all(
            helper.initialUsers.map((user) => new User(user).save())
        )
    })

    test('all users are returned', async () => {
        const users = await helper.usersInDb()

        assert.strictEqual(users.length, helper.initialUsers.length)
    })

    describe('addition of new user', () => {
        test('a user can be added', async () => {
            const newUser = {
                username: 'abangabangan',
                name: 'domo',
                password: 'secret123'
            }

            await api
              .post('/api/users')
              .send(newUser)
              .expect(201)
              .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)

            const usernames = usersAtEnd.map((r) => r.username)
            assert(usernames.includes('abangabangan'))
        })

        test('username must be at least 3 characters long', async () => {
            const newUser = {
                username: 'ab',
                name: 'domo',
                password: 'secret123'
            }

            await api
              .post('/api/users')
              .send(newUser)
              .expect(400)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
        })

        test('password must be at least 3 characters long', async () => {
            const newUser = {
                username: 'abc',
                name: 'domo',
                password: '12'
            }

            await api
              .post('/api/users')
              .send(newUser)
              .expect(400)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
        })

        test('username must be unique', async () => {
            const duplicateUser = {
                username: helper.initialUsers[0].username,
                name: 'new name',
                password: 'secret123'
            }

            await api
              .post('/api/users')
              .send(duplicateUser)
              .expect(400)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
        })

        test('an invalid user cannot be created', async () => {
            const invalidUser = {
                username: '',
                name: 'domo',
                password: ''
            }

            await api
              .post('/api/users')
              .send(invalidUser)
              .expect(400)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})