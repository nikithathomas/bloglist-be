const dummy=(blogs)=>{
    return 1;
}
const totalLikes=(blogs)=>{
    return blogs.reduce((sum,item)=>{
        return sum+item.likes;
    },0);
}
const favoriteBlog=(blogs)=>{
    const blogsLength=blogs.length;
    if(blogsLength>0){
        if(blogs.length>1){
            blogs.sort((a,b)=>{
                return b.likes-a.likes;
            });
        }     
        const {title,author,likes}=blogs[0];
        return {title,author,likes};
    }
    return {};
}
const mostBlogs=(blogs)=>{
    const bloggers={};
    const mostBlogs={};
    const blogLength=blogs.length;
    if(blogLength===1){
        const {author}=blogs[0];
        return {author,blogs:1};
    }
    blogs.forEach((blog)=>{
        const currentBlogAuthor=blog.author;
        if(bloggers.hasOwnProperty(blog.author)){
            bloggers[blog.author]=parseInt(bloggers[blog.author],10)+1;
        }else{
            bloggers[blog.author]=1;
        }
        const currentBloggerNumber=parseInt(bloggers[blog.author],10);

        if(currentBloggerNumber>mostBlogs.blogs || !mostBlogs.blogs){
            mostBlogs.author=currentBlogAuthor;
            mostBlogs.blogs=currentBloggerNumber;
        }
    });
    return mostBlogs;
}

const mostLikes=(blogs)=>{
    const bloggers={};
    const mostLikes={};
    const blogLength=blogs.length;
    if(blogLength===1){
        const {author,likes}=blogs[0];
        return {author,likes};
    }
    blogs.forEach((blog)=>{
        const currentBlogAuthor=blog.author;
        if(bloggers.hasOwnProperty(blog.author)){
            bloggers[blog.author]=parseInt(bloggers[blog.author],10)+blog.likes;
        }else{
            bloggers[blog.author]=blog.likes;
        }
        const currentBloggerNumber=parseInt(bloggers[blog.author],10);
        if(currentBloggerNumber>mostLikes.likes || !mostLikes.likes){
            mostLikes.author=currentBlogAuthor;
            mostLikes.likes=currentBloggerNumber;
        }
    });
    return mostLikes;
}
module.exports={
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}