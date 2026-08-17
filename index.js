import e from 'express'
import { configDotenv } from 'dotenv'

configDotenv()

const PORT = process.env.PORT || 3000;

const app = e()


app.use(e.json())



app.listen(PORT, () => {
    console.log(`The server is running on PORT: ${PORT}`)
})