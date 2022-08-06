const logger = require('./logger');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const User = require('../models/User');

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next();
}
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
}

const errorHandler = (error, request, response, next) => {
    logger.error(error);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted input' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message });
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }
    next(error);
}
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        request.token = authorization.substring(7)
    } else {
        request.token = null;
    }
    console.log('JWT token ',request.token);
    next();
}

const userExtractor = async (request, response, next) => {
    const jwtToken = jwt.verify(request.token, config.SECRET);

    if (!jwtToken || !jwtToken.id) {
        return response.status(401).send({ error: 'Token is missing or invalid' })
    }
    const { id: userId } = jwtToken;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
        return response.status(401).json({ error: 'This user does not exist' });
    }

    request.user = currentUser;
    next();
}
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}