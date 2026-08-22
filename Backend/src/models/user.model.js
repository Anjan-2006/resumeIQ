const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
        username:{
              type:String,
              unique:[true,"username must be unique"],
              required:[true,"username is required"]
        },
        email:{
               type:String,
               unique:[true,"email must be unique"],
               required:[true,"email is required"]
        },
        password:{
                type:String,
                required:[true,"password is required"]
        },
        isGuest:{
                type:Boolean,
                default:false,
                index:true
        },
        guestReportGenerations:{
                type:Number,
                default:0,
                min:0
        },
        guestResumeGenerations:{
                type:Number,
                default:0,
                min:0
        }
})

const userModel=mongoose.model("users",userSchema)

module.exports=userModel


































