import request from 'supertest'
import app from '../../app.js'
import { afterAll, afterEach, beforeAll, describe } from 'vitest'
import { clearTestDb, closeTestDb, connectTestDb } from '../setup.js'

beforeAll(connectTestDb)
afterEach(closeTestDb)
afterAll(clearTestDb)

describe('POST /register', ()=>{
    it('create a user with role of customer and returns an access token', async() => {
        const res = await request(app).post('/register').send({
            name: 'user',
            email: 'user@gmail.com',
            password: 'user1234'
        })

        expect(res.status).toBe(200)
        expect(res.body.accessToken).toBeDefined()
    })
})