import request from 'supertest';
import app from '../app';
import db from '../db';

describe('/Events API', () =>{
    let token : string;
    const testUser = {
        username: `organizer_${Date.now()}`,
        password: 'testpassword'
    };

    beforeAll(async () => {
        await request(app)
            .post('/api/register')
            .field('username',testUser.username)
            .field('password',testUser.password)
            .field('bio', 'I plan events')
            .field('hobbies', JSON.stringify(['Coding']));

            //Login
            const loginRes = await request(app)
                .post('/api/login')
                .send({
                    username:testUser.username,
                    password: testUser.password
                });

            token = loginRes.body.token;
    });

    it('should fail to create event without token',async() =>{
        const res = await request(app)
            .post('/api/events')
            .send({name: 'Hackaton'});

        expect(res.status).toBe(401);
    });

    it('should create a new event with valid token', async() =>{
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Hackathon')
            .field('description', '24-hour coding event')
            .field('location', 'Online')
            .field('date', '2024-12-01')
            .field('selectedHobbies', JSON.stringify(['Coding']))
            .attach('eventImage', Buffer.from([0x89,0x50,0x4E,0x47]), 'hackathon.png');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('eventId');
        expect(res.body.message).toBe('Event created');
    })

    it('should get all events', async () => {
        const res = await request(app).get('/api/events');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => {
            db.run('DELETE FROM users WHERE username = ?', [testUser.username], () => {
                resolve();
            });
        });
    });
})