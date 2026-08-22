require("dotenv").config()
const app=require("./src/app.js")
const connectTODB=require("./src/config/database.js")

connectTODB()
app.listen(3000,()=>{
      console.log("listening at port 3000")
})