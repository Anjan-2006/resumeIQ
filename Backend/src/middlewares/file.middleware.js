const multer=require('multer')

const upload=multer({
      storage:multer.memoryStorage(),
      limits:{
           fileSize:3*1024*1024 //3MB Max file size
      },
      fileFilter:(req,file,callback)=>{
            if(file.mimetype !== "application/pdf" || !/\.pdf$/i.test(file.originalname)){
                  return callback(new Error("Only PDF resume files are supported"))
            }
            return callback(null,true)
      }
})


module.exports=upload