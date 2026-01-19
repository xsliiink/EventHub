import request from 'supertest';
import app from '../app';
import path from 'path';
import fs from 'fs';
import { db } from '../app'; 

interface userRow{
    id: number;
    username: string;
    password: string;
    bio?: string;
    avatar?: string;
}

describe('Auth API',() =>{
    
    const username = `user_${Date.now()}`;

    it('Should register a new user with avatar and hobbies', async () =>{

        //creating an avatar file
        const testImagePath = path.join(__dirname, 'test-avatar.png');
        if(!fs.existsSync(testImagePath)){
            fs.writeFileSync(testImagePath, 'fake-image-content')
        }

        const response  = await request(app)
            .post('/api/register')

            .field('username', username)
            .field('password','secret123')
            .field('bio','Hello I am a test user')
            .field('hobbies',JSON.stringify(['Music']))
            .attach('avatar',testImagePath);

        expect(response.status).toBe(200);

        await new Promise<void>((resolve,reject) =>{
        db.get('SELECT * FROM users WHERE username = ?',[username],(err: Error | null,row: userRow | undefined) =>{
            if(err) return reject(err);
            
            expect(row).toBeDefined();
            if(row){
                expect(row.bio).toBe('Hello I am a test user');
                expect(row.username).toBe(username);
            }
            resolve();
        })
    });
        expect(response.body).toHaveProperty('userId');
        expect(response.body.message).toMatch(/success/i);
    });

    afterAll(() => {
        const testImagePath = path.join(__dirname, 'test-avatar.png');
        const testUploadsPath = path.join(__dirname, 'uploads');

        //deleting test avatar file
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath); // Deleting the file after all tests
        }

        //deleting uploads folder
        if (fs.existsSync(testUploadsPath)) {
            fs.rmSync(testUploadsPath, { recursive: true, force: true });
        }
    });
})