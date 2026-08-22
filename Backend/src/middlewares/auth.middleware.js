const jwt=require("jsonwebtoken")
const config=require("../config/config")
const tokenBlackListModel=require("../models/blacklist.model")

async function authUser(req,res,next){
    const token=req.cookies.token

    if(!token){
           return res.status(401).json({
               message:"token not provided "
           })
    }

    const blacklisttoken=await tokenBlackListModel.findOne({token})
   
    if(blacklisttoken){
      return res.status(401).json({
          message:"token is blacklisted try to login again"
      })
           
    }

    try{
            const decoded=jwt.verify(token,config.JWT_SECRET)
            req.user=decoded
            next()
    }
    catch(err){
          return res.status(401).json({
              message:"invalid token"
          })
    }
}

module.exports={authUser}