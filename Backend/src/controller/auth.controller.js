const userModel=require("../models/user.model")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const config=require("../config/config")
const tokenBlackListModel=require("../models/blacklist.model")
const crypto=require("crypto")

const cookieOptions={
     httpOnly:true,
     secure:config.NODE_ENV === "production",
     sameSite:config.NODE_ENV === "production" ? "none" : "lax",
     maxAge:24*60*60*1000
}

async function register(req,res){
      const {username,email,password}=req.body;

      if(!username || !email || !password){
         return res.status(400).json({
             message:"enter all the details"
          })
      }

      const isUserAlreadyExists=await userModel.findOne({
           $or:[{username},{email}]
      })

      if(isUserAlreadyExists){
          return res.status(400).json({
             message:"user already exists with the same username or email"
          })
      }
  
     const hashpassword=await bcrypt.hash(password,10)

     const newUser=await userModel.create({
          username:username,
          email:email,
          password:hashpassword
     })

     const token=jwt.sign(
           {id:newUser._id,username:newUser.username},
           config.JWT_SECRET,
           {expiresIn:"1d"}
     )

     res.cookie("token",token,cookieOptions)

     res.status(201).json({
          message:"user successfully created",
           user:{
               id:newUser._id,
               username:newUser.username,
               email:newUser.email
          }
     })
      
}

async function login(req,res){
       const {email,password}=req.body

       const user=await userModel.findOne({email})

       if(!user){
          return res.status(400).json({
              message:"invalid email or password"
          })
       }

       const isPasswordValid=await bcrypt.compare(password,user.password)

       if(!isPasswordValid){
           return res.status(400).json({
               message:"invalid email or password"
           })
       }

       const token=jwt.sign(
            {id:user._id,username:user.username},
            config.JWT_SECRET,
            {expiresIn:'1d'}
       )

     res.cookie("token",token,cookieOptions)

       res.status(200).json({
          message:"user logged in successfully",
          user:{
               id:user._id,
               username:user.username,
               email:user.email
          }
       })

}

async function guestLogin(req,res){
     try{
          const guestIdentifier=crypto.randomBytes(12).toString("hex")
          const guestUser=await userModel.create({
               username:`Guest Demo ${guestIdentifier}`,
               email:`guest-${guestIdentifier}@resumeiq.local`,
               password:await bcrypt.hash(crypto.randomBytes(32).toString("hex"),10),
               isGuest:true
          })

          const token=jwt.sign(
               {id:guestUser._id,username:guestUser.username},
               config.JWT_SECRET,
               {expiresIn:"1d"}
          )

          res.cookie("token",token,cookieOptions)
          return res.status(200).json({
               message:"guest user logged in successfully",
               user:{
                    id:guestUser._id,
                    username:guestUser.username,
                    email:guestUser.email,
                    isGuest:true
               }
          })
     }
     catch(err){
          console.error("Guest login error:",err)
          return res.status(500).json({message:"Unable to start guest demo"})
     }
}

async function logout(req,res){
      const token=req.cookies.token
      if(token){
             await tokenBlackListModel.create({token})
             res.clearCookie("token",cookieOptions)
             res.status(200).json({
                  message:"user logged out successfully"
             })
      }
      else{
            res.status(400).json({
                 message:"cannot logout without token"
            })
      }
}


async function getMe(req,res){
      const user=await userModel.findById(req.user.id)

      res.status(200).json({
             message:`Details of the ${user.username}`,
             user:{
                  id:user._id,
                  username:user.username,
                  email:user.email
             } 
      })
}

module.exports={register,login,guestLogin,logout,getMe}