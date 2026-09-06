require("dotenv").config()

if(!process.env.MONGO_URI){
      throw new Error("MONGO_URI is not defined in the env variables")
}
if(!process.env.JWT_SECRET){
      throw new Error("JWT SECRET is not defined in the env variables")
}
if(!process.env.GROQ_API_KEY){
      throw new Error("GROQ_API_KEY is not defined in the env variables")
}
if(!process.env.AWS_REGION){
      throw new Error("AWS_REGION is not defined in the env variables")
}
if(!process.env.S3_BUCKET_NAME){
      throw new Error("S3_BUCKET_NAME is not defined in the env variables")
}
if(!process.env.FRONTEND_URL){
      throw new Error("FRONTEND_URL is not defined in the env variables")
}
if(!process.env.GOOGLE_CLIENT_ID){
      throw new Error("GOOGLE_CLIENT_ID is not defined in the env variables")
}
if(!process.env.GOOGLE_CLIENT_SECRET){
      throw new Error("GOOGLE_CLIENT_SECRET is not defined in the env variables")
}
if(!process.env.GOOGLE_CALLBACK_URL){
      throw new Error("GOOGLE_CALLBACK_URL is not defined in the env variables")
}
if(!process.env.SMTP_HOST){
      throw new Error("SMTP_HOST is not defined in the env variables")
}
if(!process.env.SMTP_PORT){
      throw new Error("SMTP_PORT is not defined in the env variables")
}
if(!process.env.SMTP_USER){
      throw new Error("SMTP_USER is not defined in the env variables")
}
if(!process.env.SMTP_PASS){
      throw new Error("SMTP_PASS is not defined in the env variables")
}

const config={
      MONGO_URI:process.env.MONGO_URI,
      JWT_SECRET:process.env.JWT_SECRET,
      GROQ_API_KEY:process.env.GROQ_API_KEY,
      AWS_REGION:process.env.AWS_REGION,
      S3_BUCKET_NAME:process.env.S3_BUCKET_NAME,
      AWS_ACCESS_KEY_ID:process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY:process.env.AWS_SECRET_ACCESS_KEY,
      AWS_SESSION_TOKEN:process.env.AWS_SESSION_TOKEN,
      FRONTEND_URL:process.env.FRONTEND_URL,
      NODE_ENV:process.env.NODE_ENV || "development",
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
      REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
      GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL:process.env.GOOGLE_CALLBACK_URL,
      SMTP_HOST:process.env.SMTP_HOST,
      SMTP_PORT:process.env.SMTP_PORT,
      SMTP_USER:process.env.SMTP_USER,
      SMTP_PASS:process.env.SMTP_PASS,
      REDIS_HOST:process.env.REDIS_HOST || "127.0.0.1",
      REDIS_PORT:parseInt(process.env.REDIS_PORT, 10) || 6379,
      REDIS_PASSWORD:process.env.REDIS_PASSWORD || undefined,
      REDIS_URL:process.env.REDIS_URL || undefined,
      WORKER_CONCURRENCY:parseInt(process.env.WORKER_CONCURRENCY, 10) || 2
}

module.exports=config;