const mongoose=require("mongoose")
const config=require("./config")

async function MongoDBConnect(){

      try{
      await mongoose.connect(config.MONGO_URI)
      console.log("connected to DB")
      }
      catch(err){
          console.log(err)
      }
}

module.exports=MongoDBConnect;