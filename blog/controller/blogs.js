const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {

  let user = await User.findById(request.body.userId)

  if (!user) {
    const users = await User.find({})
    if (!users) {
      return response.status(400).json({ error: 'there are no users' })
    }

    user = await User.findOne()
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id
  })

  if (!request.body.title || !request.body.url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog) 
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  const title = request.body.title ?? blog.title
  const author = request.body.author ?? blog.author
  const url = request.body.url ?? blog.url
  const likes = request.body.likes ?? blog.likes

  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes
  blog.id = request.params.id

  const updatedBlog = await blog.save()
  response.json(updatedBlog)
})

module.exports = blogsRouter