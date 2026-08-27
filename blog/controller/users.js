const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    return response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })

    if (existingUser) {
        return response.status(400).json({ error: 'username must be unique '})
    }

    if (!password) {
        return response.status(400).json({ error: 'password cannot be empty' })
    }

    if (password.length < 3) {
        return response.status(400).json({ error: 'password has to be at least 3 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash,
        name
    })

    const savedUser = await user.save()

    return response.status(201).json(savedUser)
})

module.exports = usersRouter