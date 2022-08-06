const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const Blog = require('../models/Blog');
const User = require('../models/User');

const testHelper = require('./test_helper');

const app = require('../app');
const api = supertest(app);

const getJwtToken = async (existingUser) => {
    const logInUser = await api.post('/api/login').send(existingUser);

    const { jwtToken } = logInUser.body;
    return jwtToken;
}
beforeEach(async () => {
    //    const blogModels=testHelper.initialBlogs.map((blog)=>new Blog(blog));
    //    const promiseArray=blogModels.map((blog)=>blog.save());
    //    await Promise.all(promiseArray);

    await Blog.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const newUser = new User({
        username: 'root',
        passwordHash,
    });
    const savedUser = await newUser.save();

    const newBlog = new Blog({
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        user: savedUser._id
    });
    const savedBlog = await newBlog.save();

    savedUser.blogs = savedUser.blogs.concat(savedBlog._id);
    await savedUser.save();
});

describe('All blogs are returned with db has data', () => {
    test('blogs are returned as json', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const blogResponse = await api.get('/api/blogs').set('Authorization', `bearer ${jwtToken}`).expect(200).expect('Content-type', /application\/json/);

        expect(blogResponse.body.length).toBe(1);
    });

    test('blogs have the id property defined', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const blogResponse = await api.get('/api/blogs').set('Authorization', `bearer ${jwtToken}`);

        blogResponse.body.forEach((blog) => {
            expect(blog.id).toBeDefined();
        })
    })
})

describe('Adding blogs to blog list', () => {
    test('a valid blog can be added to the list of blogs', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const newBlog = {
            title: "Acing the Moka",
            author: "Nikita Thomas",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 5,
        }

        const savedBlog = await api.post('/api/blogs').send(newBlog).set('Authorization', `bearer ${jwtToken}`).expect(201).expect('Content-type', /application\/json/);

        const dbBlogs = await testHelper.fetchBlogs();

        expect(dbBlogs.length).toBe(2);

        const insertedBlog = dbBlogs.filter((blog) => {
            if (blog.title === newBlog.title && blog.author === newBlog.author && blog.url === newBlog.url && blog.likes === newBlog.likes) {
                return blog;
            }
        });
        const { user } = savedBlog.body;

        expect(insertedBlog.length).toBe(1);

        expect(user.toString().length).toBeGreaterThan(0);
    })

    test('a valid blog with no likes can be added to the list of blogs', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const newBlog = {
            title: "Acing the Moka",
            author: "Nikita Thomas",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        }

        const savedBlog = await api.post('/api/blogs').send(newBlog).set('Authorization', `bearer ${jwtToken}`).expect(201).expect('Content-type', /application\/json/);

        const dbBlogs = await testHelper.fetchBlogs();

        expect(dbBlogs.length).toBe(2);

        expect(savedBlog.body.likes).toBe(0);
    });

    test('an invalid blog cannot be added to the list of blogs', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const newBlog = {
            author: "Nikita Thomas",
            likes: 0
        }

        await api.post('/api/blogs').send(newBlog).set('Authorization', `bearer ${jwtToken}`).expect(400)

        const dbBlogs = await testHelper.fetchBlogs();

        expect(dbBlogs.length).toBe(1);

    });
    test('a request to insert a new blog with no token', async () => {
        const newBlog = {
            title: "Acing the Moka",
            author: "Nikita Thomas",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        }

        const savedBlog = await api.post('/api/blogs').send(newBlog).expect(401);

    })
});
describe('Delete specific blog', () => {
    test('Delete a blog present in the list of blogs', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const blogList = await testHelper.fetchBlogs();

        const blogToDelete = blogList[0].id;

        await api.delete(`/api/blogs/${blogToDelete}`).set('Authorization', `bearer ${jwtToken}`).expect(204);

        const afterDelete = await testHelper.fetchBlogs();

        expect(afterDelete.length).toBe(0);
    });
    test('try to delete a blog with no token', async () => {
        const blogList = await testHelper.fetchBlogs();

        const blogToDelete = blogList[0].id;

        await api.delete(`/api/blogs/${blogToDelete}`).expect(401);
    });
})

describe('Update the likes of a blog', () => {
    test('update the likes of a valid blog', async () => {
        const existingUser = {
            username: 'root',
            password: 'sekret'
        }
        const jwtToken = await getJwtToken(existingUser);

        const allBlogs = await testHelper.fetchBlogs();

        const selectedBlog = allBlogs[0];
        const updatedBlog = {
            ...selectedBlog,
            likes: selectedBlog.likes + 7
        }

        const updatedData = await api.put(`/api/blogs/${selectedBlog.id}`).send(updatedBlog).set('Authorization', `bearer ${jwtToken}`).expect(200).expect('Content-type', /application\/json/);
        expect(updatedData.body.likes).toBe(updatedBlog.likes);
    });
    test('update the likes without a token', async () => {
        const allBlogs = await testHelper.fetchBlogs();
        const selectedBlog = allBlogs[0];

        const updatedBlog = {
            ...selectedBlog,
            likes: selectedBlog.likes + 7
        }

        await api.put(`/api/blogs/${selectedBlog.id}`).expect(401);
    })
})
afterAll(() => {
    mongoose.connection.close();
})
