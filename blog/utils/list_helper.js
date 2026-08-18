const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    if (!blogs) {
        return 0
    }
    else if (blogs.length == 1){
        return blogs[0]
    }
    else {
        return blogs.reduce((acc, cur) => acc + cur, 0)
    }
}

module.exports = {
    dummy,
    totalLikes
}