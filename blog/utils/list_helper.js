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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}