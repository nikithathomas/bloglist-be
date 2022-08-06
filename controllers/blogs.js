const blogsRouter = require('express').Router();
const jwt=require('jsonwebtoken');

const config=require('../utils/config');
const Blog = require('../models/Blog');
const User = require('../models/User');


blogsRouter.get('/', async (request, response) => {
    const blogResponse = await Blog.find({}).populate('user',{username:1,name:1});
    response.send(blogResponse);
});

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (!body || !body.title || !body.author) {
        return response.status(400).end();
    }

    const currentUser=request.user;

    const newBlog = new Blog({
        title:body.title,
        author:body.author,
        url:body.url,
        likes:body.likes,
        user: currentUser._id
    })
    const savedBlog = await newBlog.save();

    currentUser.blogs=currentUser.blogs.concat(savedBlog._id);
    await currentUser.save();

    response.status(201).json(savedBlog);
})
blogsRouter.delete('/:blogId', async (request, response) => {
    const blogId = request.params.blogId;

    const currentUser=request.user;
    
    const currentBlog=await Blog.findById(blogId);
    const {user:blogCreator}=currentBlog;

    if(currentUser._id.toString()===blogCreator.toString()){
        await Blog.findByIdAndDelete(blogId);
        return response.status(204).end();
    }
    return response.status(401).json({error:'Not authorized to delete this blog'});
});

blogsRouter.put('/:blogId', async (request, response) => {
    const blogId = request.params.blogId;
    const update= {likes:request.body.likes};
    const updatedBlog = await Blog.findByIdAndUpdate(blogId,update, { new: true });
    response.json(updatedBlog);
})
module.exports = blogsRouter;