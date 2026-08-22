require("dotenv").config()

if(!process.env.MONGO_URI){
      throw new Error("MONGO_URI is not defined in the env variables")
}
if(!process.env.JWT_SECRET){
      throw new Error("JWT SECRET is not defined in the env variables")
}
if(!process.env.GROQ_API_KEY){
      throw new Error("JWT SECRET is not defined in the env variables")
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

const config={
      MONGO_URI:process.env.MONGO_URI,
      JWT_SECRET:process.env.JWT_SECRET,
      GROQ_API_KEY:process.env.GROQ_API_KEY,
      AWS_REGION:process.env.AWS_REGION,
      S3_BUCKET_NAME:process.env.S3_BUCKET_NAME,
      FRONTEND_URL:process.env.FRONTEND_URL,
      NODE_ENV:process.env.NODE_ENV || "development"
}

module.exports=config;