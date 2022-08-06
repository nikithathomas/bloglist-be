const bcrypt=require('bcrypt');
const usersRouter=require('express').Router();
const User=require('../models/User');

usersRouter.get('/',async (request,response)=>{
    const users=await User.find({}).populate('blogs',{url:1,title:1,author:1});
    response.json(users);
})
usersRouter.post('/',async(request,response)=>{
    const {username,name,password}=request.body;
    if(!username|| !name || !password || password.length<3){
        return response.status(400).send({error:'Input incorrect'});
    }
    const existingUsername=await User.findOne({username});

    if(existingUsername){
        return response.status(400).send({error:'Username already exists'});
    }
    const saltRounds=10;
    const passwordHash=await bcrypt.hash(password,saltRounds);

    const newUser=new User({
        username,
        name,
        passwordHash
    });
    const savedUser=await newUser.save();
    response.status(201).json(savedUser);
})

module.exports=usersRouter;