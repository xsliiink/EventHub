import request from 'supertest';
import app from '../app';

describe('/Hobbies API', () =>{
    it('should retrieve the list of hobbies', async() =>{
        const response  = await request(app).get('/api/hobbies');

        expect (response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        if(response.body.length > 0)
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
    })
})
