const supertest = require('supertest');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const testHelper = require('./test_helper');
const app = require('../app');
const User = require('../models/User');
const api = supertest(app);

beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('sekret', 10);
    const newUser = new User({
        username: 'root',
        passwordHash
    });
    await newUser.save();
})
describe('Create a new user', () => {
    test('Create a user with valid input', async () => {
        const usersBeforeUpdate = await testHelper.fetchUsers();
        const newUser = {
            username: 'sdfsd',
            name: 'sdfds',
            password: 'secret'
        }
        const savedUser = await api.post('/api/users').send(newUser).expect(201).expect('Content-type', /application\/json/);

        const usersAfterUpdate = await testHelper.fetchUsers();

        expect(usersAfterUpdate.length).toBe(usersBeforeUpdate.length + 1);

        const usernames = usersAfterUpdate.map((user) => user.username);

        expect(usernames).toContain(savedUser.body.username);
    });
    test('Create a user with no or few input', async () => {
        const newUser = {
            username: 'sdfsd',
            name: 'sdfds',
        }
        await api.post('/api/users').send(newUser).expect(400);
    });
    test('Create a user with a password of lesser than 3 characters', async () => {
        const newUser = {
            username: 'sdfsd',
            name: 'sdfds',
            password: 'se'
        }
        await api.post('/api/users').send(newUser).expect(400);
    });
    test('Create a user with an existing username', async () => {
        const newUser = {
            username: 'root',
            name: 'sdfds',
            password: 'secret'
        }
        await api.post('/api/users').send(newUser).expect(400);
    })
})

afterAll(() => {
    mongoose.connection.close();
})