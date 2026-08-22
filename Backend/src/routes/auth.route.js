const {Router}=require('express')
const authController=require('../controller/auth.controller')
const authMiddleWare=require("../middlewares/auth.middleware")


const authRouter=Router();


authRouter.post('/register',authController.register)
authRouter.post('/login',authController.login)
authRouter.post('/guest-login',authController.guestLogin)
authRouter.get('/logout',authController.logout)
authRouter.get('/getme',authMiddleWare.authUser,authController.getMe)

module.exports=authRouter;