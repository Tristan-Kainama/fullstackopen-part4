const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const assert = require('assert')

const api = supertest(app)

const getTokenFor = (user) => {
  return jwt.sign({ username: user.username, id: user._id.toString() }, process.env.SECRET)
}

describe('when there is initially some blogs saved inside', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        await Promise.all(
            helper.initialUsers.map((user) => new User(user).save())
        )

        let blogObject = new Blog(helper.initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(helper.initialBlogs[1])
        await blogObject.save()
    })

    test('all blogs are returned', async () => {
        const blogsAtStart = await helper.blogsInDb()

        assert.strictEqual(blogsAtStart.length, helper.initialBlogs.length)
    })

    test("_id property is change to id", async () => {
        const blogsAtStart = await helper.blogsInDb()

        assert.strictEqual(Object.hasOwn(blogsAtStart[0], 'id'), true)
    })

    describe('viewing a specific blog', () => {
        test('has no likes property or not', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToView = blogsAtStart[0]

            const resultBlog = await api
              .get(`/api/blogs/${blogToView.id}`)
              .expect(200)
              .expect('Content-Type', /application\/json/)

            const likesBlog = resultBlog.body.likes ?? 0

            assert.strictEqual(likesBlog, 7)
        })
    })

    describe('addition of new blog', () => {
        test('a valid blog can be added', async () => {
            const newBlog = {
                _id: '5a422b891b54a676234d17fa',
                title: 'First class tests',
                author: 'Robert C. Martin',
                url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
                likes: 10,
                __v: 0
            }

            const token = getTokenFor(await User.findOne({ username: helper.initialUsers[0].username }))

            await api
              .post('/api/blogs')
              .set('Authorization', `Bearer ${token}`)
              .send(newBlog)
              .expect(201)
              .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

            const urls = blogsAtEnd.map((r) => r.url)
            assert(urls.includes('http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'))
        })

        test('returns error when trying to add new blog with no author and url', async () => {
            const newBlog = {
                _id: '5a422b891b54a676234d17fa',
                title: 'First class tests',
                likes: 10,
                __v: 0
            }

            const token = getTokenFor(await User.findOne({ username: helper.initialUsers[0].username }))

            await api
              .post('/api/blogs')
              .set('Authorization', `Bearer ${token}`)
              .send(newBlog)
              .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

        test('fails with 401 if token is not provided', async () => {
            const newBlog = {
                _id: '5a422b891b54a676234d17fb',
                title: 'Unauthenticated blog',
                author: 'Anonymous',
                url: 'https://example.com/unauthorized',
                likes: 0,
                __v: 0
            }

            await api
              .post('/api/blogs')
              .send(newBlog)
              .expect(401)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe('deletion of a blog', () => {
        test('delete succesful', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]
            const token = getTokenFor(await User.findOne({ username: helper.initialUsers[0].username }))

            await api
              .delete(`/api/blogs/${blogToDelete.id}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            const ids = blogsAtEnd.map((n) => n.id)
            assert(!ids.includes(blogToDelete.id))

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
        })

        test('if no blog is found by id, returns error', async () => {
            await api
              .delete('/api/blogs/4')
              .expect(400)
        })
    })

    describe('update single blog', () => {
        test('update sucessful', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedBlog = {
                title: 'First class tests',
                author: 'Robert C. Martin',
                url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
                likes: 10,
                id: blogToUpdate.id,
                user: blogToUpdate.user
            }

            await api
              .put(`/api/blogs/${blogToUpdate.id}`)
              .send({
                title: 'First class tests',
                author: 'Robert C. Martin',
                url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
                likes: 10
              })
              .expect(200)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd[0].title, updatedBlog.title)
            assert.strictEqual(blogsAtEnd[0].author, updatedBlog.author)
            assert.strictEqual(blogsAtEnd[0].url, updatedBlog.url)
            assert.strictEqual(blogsAtEnd[0].likes, updatedBlog.likes)
            assert.strictEqual(blogsAtEnd[0].id, updatedBlog.id)
            assert.strictEqual(blogsAtEnd[0].user.toString(), updatedBlog.user.toString())
        })

        test('error when send is empty', async () => {
            await api
              .put('/api/blogs/5a422aa71b54a676234d17f9')
              .send({})
              .expect(404)
        })

        test('still works if missing a properties', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedBlogToSend = {
                author: 'Robert C. Martin',
                url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
            }

            const updatedBlog = {
                id: blogToUpdate.id,
                title: 'React patterns',
                author: 'Robert C. Martin',
                url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
                likes: 7,
                user: blogToUpdate.user
            }

            await api
              .put(`/api/blogs/${blogToUpdate.id}`)
              .send(updatedBlogToSend)
              .expect(200)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd[0].title, updatedBlog.title)
            assert.strictEqual(blogsAtEnd[0].author, updatedBlog.author)
            assert.strictEqual(blogsAtEnd[0].url, updatedBlog.url)
            assert.strictEqual(blogsAtEnd[0].likes, updatedBlog.likes)
            assert.strictEqual(blogsAtEnd[0].id, updatedBlog.id)
            assert.strictEqual(blogsAtEnd[0].user.toString(), updatedBlog.user.toString())
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})