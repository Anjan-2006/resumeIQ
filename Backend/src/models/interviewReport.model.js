const mongoose=require("mongoose")


const technicalQuestionSchema=new mongoose.Schema({     
      question:{
           type:String,
           required:[true,"Technical Question is required"]
      },
      intention:{
           type:String,
           required:[true,"intension is required"]
      },
      answer:{
           type:String,
           required:[true,"answer is required"]
      }
   }, 
   {
     _id:false, 
   })

const behaviouralQuestionSchema=new mongoose.Schema({     
      question:{
           type:String,
           required:[true,"Behavioural Question is required"]
      },
      intention:{
           type:String,
           required:[true,"intension is required"]
      },
      answer:{
           type:String,
           required:[true,"answer is required"]
      }
   }, 
   {
     _id:false, 
   })


const skillGapsSchema=new mongoose.Schema({     
      skills:{
          type:String,
          required:[true,"skills are required"]
      },
      severity:{
           type:String,
           enum:["low","medium","high"],
           required:[true,"severity is required"]
      }
   }, 
   {
     _id:false, 
})

const preparationPlanSchema=new mongoose.Schema({
     day:{
          type:String,
          required:[true,"Day is Required"]
     },
     focus:{
          type:String,
          required:[true,"Focus is required"]
     },
     tasks:[{
           type:String,
           required:[true,"task is required"]
     }]
      
},{_id:false})



const interviewReportSchema=new mongoose.Schema({
      jobDescription:{
            type:String,
            required:[true,"Job Description is Required"]
      },
      resume:{
            type:String,
      },
      selfDescription:{
            type:String, 
      },
      matchScore:{
          type:Number,
          min:0,
          max:100
      },
     technicalQuestions:[technicalQuestionSchema],
     behaviouralQuestions:[behaviouralQuestionSchema],
     skillGaps:[skillGapsSchema],
     preparationPlanSchema:[preparationPlanSchema],
     user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
     },
     title:{
            type:String,
             required:[true,"title of the interview report is required"]
     },
     status:{
            type:String,
            enum:["pending","processing","completed","failed"],
            default:"pending",
            index:true
     },
     error:{
            type:String,
            default:null
     }
}, { timestamps: true })


const interviewModel=mongoose.model("InterviewReport",interviewReportSchema)

module.exports=interviewModel