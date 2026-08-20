import { configDotenv } from 'dotenv'
import { connectDb } from './lib/connectDB..js';
import app from './app.js';


configDotenv()

const PORT = process.env.PORT || 3000;




app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}`)
    connectDb()
})