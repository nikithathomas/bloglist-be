const supertest=require('supertest');
const bcrypt=require('bcrypt');

const app=require('../app');
const User=require('../models/User');

const api=supertest(app);

describe('Login a user',()=>{
    beforeEach(async () => {
        await User.deleteMany({});
        const passwordHash = await bcrypt.hash('sekret', 10);
        const newUser = new User({
            username: 'root',
            passwordHash
        });
        await newUser.save();
    });
    test('with valid credentials',async()=>{
        const userToLogin={
            username:'root',
            password:'sekret'
        }
        const isUserLoggedIn=await api.post('/api/login').send(userToLogin).expect(200).expect('Content-type',/application\/json/);

        const {username}=isUserLoggedIn.body;

        expect(userToLogin.username).toBe(username);
    });
    test('with invalid password',async()=>{
        const userToLogin={
            username:'root',
            password:'werwe'
        }
        await api.post('/api/login').send(userToLogin).expect(401);
    });
    test('with invalid username',async()=>{
        const userToLogin={
            username:'swew',
            password:'werwe'
        }
        await api.post('/api/login').send(userToLogin).expect(401);
    });
    test('with no input',async()=>{
        await api.post('/api/login').expect(400);
    });
})