const Blog = require('../models/blog.js')
const User = require('../models/user.js')

const initialBlogs = [
            {
                _id: "5a422a851b54a676234d17f7",
                title: "React patterns",
                author: "Michael Chan",
                url: "https://reactpatterns.com/",
                likes: 7,
                __v: 0
            },
            {
                _id: "5a422aa71b54a676234d17f8",
                title: "Go To Statement Considered Harmful",
                author: "Edsger W. Dijkstra",
                url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
                likes: 5,
                __v: 0
            }
        ]

const initialUsers = [
    {
        _id: '6a905531f5236184837b0c6c',
        username: "baveryk",
        passwordHash: "$2b$10$YQojspu9lnlMwRMuXdhaYeVwmJHhNY7SDXnWYiMzDox6EEmvkjYLW",
        name: "Tristan",
        blogs: [],
        __v: 0
    }, {
        _id: '6a9055b7f5236184837b0c70',
        username: "baverykai",
        passwordHash: "$2b$10$7jP1ktwASZ2E.mQXDvI4I.Wh//VIcIUnqWum0eY.zrgbOK7w4FII6",
        name: "Tristan",
        blogs: [],
        __v: 0
    }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    initialUsers,
    blogsInDb,
    usersInDb
}