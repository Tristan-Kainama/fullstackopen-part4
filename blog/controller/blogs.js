const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
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
  const blog = new Blog(request.body)

  if (Object.hasOwn(request.body, 'author') && Object.hasOwn(request.body, 'url')) {
    const savedBlog = await blog.save() 
    response.status(201).json(savedBlog) 
  }
  else {
    response.status(400).end()
  }
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