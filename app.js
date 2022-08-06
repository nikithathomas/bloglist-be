const cors=require('cors');
const mongoose=require('mongoose');
const express=require('express');
require('express-async-errors');

const blogsRouter=require('./controllers/blogs');
const usersRouter=require('./controllers/users');
const loginRouter=require('./controllers/login');

const config=require('./utils/config');
const logger=require('./utils/logger');
const middleware=require('./utils/middleware');
const app=express();

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI).then(()=>{
    logger.info('Db connected');
}).catch((error)=>{
    logger.error('Error in db connection');
});

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs',middleware.userExtractor,blogsRouter);
app.use('/api/users',usersRouter);
app.use('/api/login',loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports=app;


