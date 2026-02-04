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
            .post('/api/auth/register')
            .field('username',testUser.username)
            .field('password',testUser.password)
            .field('bio', 'I plan events')
            .field('hobbies', JSON.stringify(['Coding']));

            //Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username:testUser.username,
                    password: testUser.password
                });

            token = loginRes.body.token;
    });

    it('should fail to create event without token',async() =>{
        const res = await request(app)
            .post('/api/events/create')
            .send({title: 'Hackaton'});

        expect(res.status).toBe(401);
    });

    it('should create a new event with valid token', async() =>{
        const res = await request(app)
            .post('/api/events/create')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Hackathon')
            .field('description', '24-hour coding event')
            .field('location', 'Online')
            .field('date', '2024-12-01')
            .field('selectedHobbies[]', 'Coding')
            .attach('eventImage', Buffer.from([0x89,0x50,0x4E,0x47]), 'hackathon.png');

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('eventId');
        expect(typeof res.body.eventId).toBe('number');
    })

    it('should fail to create event with invalid boyd', async() => {
        const res = await request(app)
        .post('/api/events/create')
        .set('Authorization', `Bearer ${token}`)
        .field('title','')//invalid
        .field('date', 'not-a-date');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    })

    it('should get all events', async () => {
        const res = await request(app).get('/api/events');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        if(res.body.length > 0){
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('title');
        }
    });

    it('should update all editable fields', async() =>{
        //Create event
         const createRes = await request(app)
        .post('/api/events/create')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Initial title')
        .field('description', 'Initial description')
        .field('location', 'Dublin')
        .field('date', '2026-02-10')
        .field('selectedHobbies[]', 'Coding');

        expect(createRes.status).toBe(201);

        const eventId = createRes.body.eventId;

        //Update all fields

        const updateRes = await request(app)
        .put(`/api/events/update/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
         .field('title', 'Updated title')
        .field('description', 'Updated description')
        .field('location', 'Galway')
        .field('date', '2026-03-01');

        //Assertions
        expect(updateRes.status).toBe(200);

        expect(updateRes.body).toMatchObject({
            id: eventId,
            title: 'Updated title',
            description: 'Updated description',
            location: 'Galway',
            date: '2026-03-01'
            })

        //Ensure unchanged fields are still valid
        expect(updateRes.body.hobbies).toContain('Coding');
    })

    it('should delete event by owner',async() =>{
        //creating an event
        const createRes = await request(app)
        .post('/api/events/create')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'To delete')
        .field('description', 'desc')
        .field('location', 'Dublin')
        .field('date', '2026-02-16')
        .field('selectedHobbies[]', 'Coding')
        .field('selectedHobbies[]', 'Music')
        .attach(
            'eventImage',
            Buffer.from([0x89, 0x50, 0x4E, 0x47]),
            'delete.png'
        );

        const eventId = createRes.body.eventId;

        const deleteRes = await request(app)
            .delete(`/api/events/delete/${eventId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.status).toBe(200)

        //Ensure event is gone from GET /events
         const getRes = await request(app).get('/api/events');

        const deletedEvent = getRes.body.find(
            (e: { id: number }) => e.id === eventId
        );

        expect(deletedEvent).toBeUndefined();

        })

    afterAll(async () => {
        await new Promise<void>((resolve) => {
            db.run('DELETE FROM users WHERE username = ?', [testUser.username], () => {
                resolve();
            });
        });
    });
})