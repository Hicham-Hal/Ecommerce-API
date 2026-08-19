import e from 'express'
import { configDotenv } from 'dotenv'
import authRoute from './routes/auth.route.js'
import adminRoute from './routes/admin.route.js'
import clientRoute from './routes/client.route.js'
import cookieParser from 'cookie-parser';

const app = e()


app.use(e.json())
app.use(cookieParser())

app.use('/', authRoute)
app.use('/dashboard', adminRoute)
app.use('/', clientRoute)

