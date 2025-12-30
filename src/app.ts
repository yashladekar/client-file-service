import express from "express"
import cors from "cors"
import helmet from "helmet"
import PinoHttp from "pino-http"
import rateLimit from "./middleware/rateLimit"
import healthRoutes from "./routes/healthRoutes"
const app = express()

app.use(helmet())
app.use(cors({ origin: "*", credentials: true }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(PinoHttp())
app.use(rateLimit)
app.use("/health", healthRoutes)

export default app