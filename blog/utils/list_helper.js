const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    if (!blogs) {
        return 0
    }
    else if (blogs.length == 1){
        return blogs[0].likes
    }
    else {
        return blogs.reduce((acc, cur) => acc + cur.likes, 0)
    }
}

const favoriteBlog = (blogs) => {
    if (blogs.length == 0) {
        return 'There are no blogs found'
    }
    else if (blogs.length == 1) {
        const blogWithHighestLikes = blogs[0]
        return blogWithHighestLikes
    }
    else {
        const blogWithHighestLikes = blogs.reduce((max, obj) => obj.likes > max.likes ? obj : max, blogs[0]);
        return blogWithHighestLikes
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length == 0) {
        return 'There are no blogs found'
    } 
    else if (blogs.length == 1) {
        const authorWithMostBlogs = {
            author: blogs[0].author,
            blogs: 1
        }
        return authorWithMostBlogs
    }
    else {
        const authorBlogs = _.countBy(blogs, 'author');
        const highest = Object.entries(authorBlogs).reduce((max, current) =>
            current[1] > max[1] ? current : max
        );

        const authorWithMostBlogs = {
            author: highest[0],
            blogs: highest[1]
        }

        return authorWithMostBlogs
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}