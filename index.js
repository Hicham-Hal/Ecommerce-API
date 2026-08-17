import e from 'express'
import { configDotenv } from 'dotenv'
import authRoute from './routes/auth.route.js'
import adminRoute from './routes/admin.route.js'
import clientRoute from './routes/client.route.js'
import { connectDb } from './lib/connectDB..js';
import cookieParser from 'cookie-parser';

configDotenv()

const PORT = process.env.PORT || 3000;

const app = e()


app.use(e.json())
app.use(cookieParser())

app.use('/', authRoute)
app.use('/dashboard', adminRoute)
app.use('/', clientRoute)


app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}`)
    connectDb()
})