import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume ,generateQuestion,generateNextQuestion, finishInterview, submitAnswer,getInterviewReport,getMyInterviews } from "../controllers/interview.controller.js"




const interviewRouter = express.Router()

interviewRouter.use(isAuth)

interviewRouter.post("/resume",upload.single("resume"),analyzeResume)

interviewRouter.post("/generate-questions",generateQuestion)
interviewRouter.post("/generate-next-question",generateNextQuestion)

interviewRouter.post("/submit-answer",submitAnswer)
interviewRouter.post("/finish",finishInterview)

interviewRouter.get("/get-interview",getMyInterviews)
interviewRouter.get("/report/:id",getInterviewReport)




export default interviewRouter