const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const assert = require('assert')

const api = supertest(app)

describe('when there is initially some blogs saved inside', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
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

        assert.strictEqual(Object.hasOwn(blogsAtStart[0], "id"), true)
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
                _id: "5a422b891b54a676234d17fa",
                title: "First class tests",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
                likes: 10,
                __v: 0
            }

            await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

            const urls = blogsAtEnd.map(r => r.url)
            assert(urls.includes('http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'))
        })

        test('returns error when trying to add new blog with no author and url', async () => {
            const newBlog = {
                _id: "5a422b891b54a676234d17fa",
                title: "First class tests",
                likes: 10,
                __v: 0
            }

            await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe('deletion of a blog', () => {
        test('delete succesful', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

            const blogsAtEnd = await helper.blogsInDb()
            
            const ids = blogsAtEnd.map(n => n.id)
            assert(!ids.includes(blogToDelete.id))

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
        })

        test('if no blog is found by id, returns error', async () => {
            await api
            .delete(`/api/blogs/4`)
            .expect(400)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})