import request from 'supertest';
import app from '../app';
import {db} from '../app';

interface userRow{
    id:number;
    username: string;
}

describe('/Login API', () => {
    const testUser = {
        username: `user_login_${Date.now()}`,
        password: 'correct_password'
    };

    //creating the user
    beforeAll(async () => {
        await request(app)
            .post('/api/register')
            .field('username',testUser.username)
            .field('password',testUser.password)
            .field('bio', 'I exist for login tests')
            .field('hobbies',JSON.stringify([]));
    });

    //successful case

    it('should login and receive a JWT token', async()=>{

        await new Promise<void>((resolve,reject) => {
            db.get(`SELECT * FROM users WHERE username = ?`,[testUser.username],(err: Error | null,row: userRow | undefined) =>{
                if(err) return reject(err);
                expect(row).toBeDefined();
                expect(row?.username).toBe(testUser.username);
                resolve();
            });
        });

        const response = await request(app)
        .post('/api/login')
        .send({
            username:  testUser.username,
            password: testUser.password
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');
        expect(response.body.message).toMatch(/success/i);
    });

    //failure case

    it('should return 400 for non-existing user',async() =>{
        const response =  await request(app)
        .post('/api/login')
        .send({
            username: 'I_dont_exists',
            password: 'some_password'
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('User not found')
    });

    //deleting the user
    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            db.run('DELETE FROM users WHERE username = ?', [testUser.username], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
})

