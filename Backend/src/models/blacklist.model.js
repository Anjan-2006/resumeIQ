const mongoose=require("mongoose")

const tokenSchema=new mongoose.Schema({
       token:{
            type:String,
            required:[true,"token is required"]
       }
},
{timestamps:true}
)

const tokenBlackListModel=mongoose.model("tokens",tokenSchema)

module.exports=tokenBlackListModel