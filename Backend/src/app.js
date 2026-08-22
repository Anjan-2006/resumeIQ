const express=require('express')
const authRouter=require('./routes/auth.route.js')
const morgan=require("morgan")
const cookieParser=require('cookie-parser')
const cors=require('cors')
const interviewRouter=require("./routes/interview.routes.js")
const config=require('./config/config.js')


const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ["http://localhost:5173", config.FRONTEND_URL];
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed"));
  },
  credentials: true
}));

//routes
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Resume file must be 3MB or smaller" });
  }

  if (error.message === "Only PDF resume files are supported") {
    return res.status(400).json({ message: error.message });
  }

  if (error.message === "Origin not allowed") {
    return res.status(403).json({ message: "Request origin is not allowed" });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ message: "Internal server error" });
});


module.exports=app