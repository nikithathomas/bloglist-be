const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt');

const config = require('../utils/config');
const User = require('../models/User');
const loginRouter = require('express').Router();

loginRouter.post('/', async(request, response) => {
    const { username, password } = request.body;

    if (!username || !password ) {
        return response.status(400).send({ error: 'No input present' });
    }
    
    console.log('Login details',{username,password});
    const isUserPresent = await User.findOne({ username });
    const doesPwdMatch = isUserPresent === null ? false : await bcrypt.compare(password, isUserPresent.passwordHash);

    if (!(isUserPresent && doesPwdMatch)) {
        return response.status(401).send({ error: 'Username or password is incorrect' });
    }
    const inputToToken = {
        username: isUserPresent,
        id: isUserPresent._id
    }
    const jwtToken = jwt.sign(inputToToken, config.SECRET);

    response.status(200).json({ jwtToken, username: isUserPresent.username, name: isUserPresent.name });
});

module.exports=loginRouter;
