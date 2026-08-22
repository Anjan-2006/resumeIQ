const GROQ=require('groq-sdk')
const config=require('../config/config')
const {z} = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer=require("puppeteer")


const ai=new GROQ({
       apiKey:config.GROQ_API_KEY,
})


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skills: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})


async function generatePdfFromHtml(htmlContent){
      const browser=await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
  try {
    const page=await browser.newPage()
    await page.setContent(htmlContent,{waitUntil:"networkidle0"})

    const pdfBuffer=await page.pdf({format:'A4'})

    return pdfBuffer
  } finally {
    await browser.close()
  }
}

async function generateInterviewReport({resume,selfDescription,jobDescription}){
      const prompt = `
               Generate a structured interview report in STRICT JSON format.

               Candidate Details:
               Resume: ${resume}
               Self Description: ${selfDescription}
               Job Description: ${jobDescription}

               Return ONLY valid JSON with EXACTLY this structure:

               {
               "matchScore": number,
               "title": string,
               "technicalQuestions": [
               {
                    "question": string,
                    "intention": string,
                    "answer": string
               }
               ],
               "behavioralQuestions": [
               {
                    "question": string,
                    "intention": string,
                    "answer": string
               }
               ],
               "skillGaps": [
               {
                    "skills": string,
                    "severity": "low" | "medium" | "high"
               }
               ],
               "preparationPlan": [
               {
                    "day": number,
                    "focus": string,
                    "tasks": string[]
               }
               ]
               }

               Do not include any explanation, markdown, or text outside JSON.Return atleast 10 questions for each of them.
               `;
                              
          const response=await ai.chat.completions.create({
               model: "openai/gpt-oss-120b",       
               messages:[
                    { role: "system", content: "You are a strict JSON generator. Only return valid JSON." },
                    { role: "user", content: prompt }
               ],
               response_format: { type: "json_object" },
               max_completion_tokens: 4096,
               temperature: 0.2
          })
           
          const text = response.choices[0].message.content;
          const cleanText = text.trim();
          const start = cleanText.indexOf("{");
          const end = cleanText.lastIndexOf("}");

          if (start === -1 || end === -1) {
               throw new Error("Invalid JSON format from model");
          }

          const jsonString = cleanText.slice(start, end + 1);

          let parsed;
          try {
               parsed = JSON.parse(jsonString);
          } catch (err) {
               console.error("Failed to parse JSON string from AI model output:", jsonString);
               throw new Error(`JSON parsing failed: ${err.message}`);
          }

          console.log(parsed)

          const result = interviewReportSchema.safeParse(parsed);

          if(!result.success){
                 console.log(result.success)
                 throw new Error("Schema Validation Failed");
          }

          const validated=result.data

          return validated
}

async function generateResumePdf({resume,selfDescription,jobDescription}){
      const resumePdf=z.object({
            html:z.string().describe("Html content which will be converted to an resume PDF using the puppeteer lib")
      })

      
     const prompt = `
     You are an elite executive resume writer and senior staff software engineer specializing in FAANG-level, ATS-optimized, single-page resumes.

     Your task is to generate a complete production-ready HTML document for a high-impact, single-page resume based on the candidate's details and target job description below.

     CANDIDATE RESUME:
     ${resume}

     CANDIDATE SELF DESCRIPTION:
     ${selfDescription}

     TARGET JOB DESCRIPTION:
     ${jobDescription}

     =========================================
     1. ABSOLUTE FACTUAL ACCURACY & METRIC RULES
     =========================================
     HIGH FACTUAL ACCURACY IS MANDATORY. FACTUAL ACCURACY > IMPRESSIVE-SOUNDING FABRICATED METRICS.

     - NEVER INVENT OR FABRICATE: Companies, job titles, responsibilities, projects, technologies, skills, certifications, achievements, education details, degrees, universities/institutions, dates, locations, metrics, percentages, performance improvements, user counts, revenue, cost savings, latency, SLAs, traffic, business impact, rankings, or any other claim. If information is not available, OMIT IT.
     - METRICS MUST NEVER BE FABRICATED: A numerical claim or percentage (e.g. "40%", "30%", "200 ms", "15%") may ONLY be included if that exact metric or an explicitly equivalent metric exists in the source material. (e.g., "AUC-ROC of 0.98" is valid to preserve; NEVER transform it into "Improved accuracy by 15%"). If the source contains no metric, write a strong qualitative bullet instead. NEVER estimate or infer numerical impact.
     - PRESERVE EDUCATION INFORMATION EXACTLY: Institution names and degree names must remain separate and distinct. "MS Ramaiah Institute of Technology" is the NAME OF THE INSTITUTION ("MS" is NOT a Master's degree!). Write "MS Ramaiah Institute of Technology" and "B.Tech in Artificial Intelligence and Data Science". NEVER write "M.S., Ramaiah Institute of Technology". Never reinterpret, expand, abbreviate, or modify institution/degree names, CGPA, or dates.
     - PRESERVE DATES EXACTLY: NEVER invent or guess dates. If a date does not exist in the source, omit it.
     - DO NOT INVENT PROJECT FEATURES: Describe only technical features present in candidate's source info.
     - DO NOT UPGRADE JOB TITLES: Preserve exact candidate job titles (e.g., "AI Automation Intern – Data & MERN Stack Developer"). Do not upgrade to "Software Engineer" or "AI Engineer" unless supported by source.
     - ACHIEVEMENTS: Preserve achievements accurately without adding explanatory fluff or invented impact.
     - JD OPTIMIZATION WITHOUT FABRICATION: Prioritize relevant existing skills, projects, and keywords from the candidate's actual background. NEVER add keywords (like AWS) if not supported by the candidate's resume.
     - REWRITING RULE: You MAY improve grammar, conciseness, and professional wording. You MAY NOT add new facts, metrics, tools, responsibilities, dates, or credentials.
     - SECTION ORDER MUST BE:
       1. Header (Name & Contact Info)
       2. Education
       3. Experience (if available)
       4. Projects
       5. Technical Skills
       6. Certifications / Achievements (if available)

     =========================================
     2. 10-POINT INTERNAL FACTUAL VERIFICATION PASS
     =========================================
     Before producing final HTML, internally verify every bullet and section:
     1. Is this supported by candidate's source?
     2. Is every technology supported?
     3. Is every number supported?
     4. Is every metric supported?
     5. Is every company supported?
     6. Is every project supported?
     7. Is every job title supported?
     8. Is every date supported?
     9. Is every education detail supported?
     10. Is every achievement supported?
     If any claim cannot be supported, REMOVE IT or rewrite it as a factual qualitative statement.

     =========================================
     2. DESIGN & LATEX STYLING SPECIFICATIONS
     =========================================
     The generated HTML must match the classic elite LaTeX / Jake's Resume / Deedy resume aesthetic (clean, modern serif typography, sharp section lines, right-aligned dates/locations).

     CSS SPECIFICATIONS (Embed directly in <style>):
     - Margins: @page { size: A4; margin: 10mm 14mm 10mm 14mm; }
     - Font: Use a crisp, elegant serif font stack: 'Times New Roman', Times, Georgia, serif.
     - Body: font-size: 9.5pt; line-height: 1.25; color: #111; margin: 0; padding: 0;
     - Header:
       - Centered layout.
       - Candidate Name: 22pt bold, uppercase or title case, letter-spacing: 0.5px.
       - Contact line: 9pt, items separated by em-dash " — " (e.g., Phone — Email — LinkedIn — GitHub — Portfolio). Links should be styled clean black with text-decoration: none or subtle underline.
     - Section Headings (.section-heading):
       - font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px;
       - border-bottom: 1px solid #222; margin-top: 10px; margin-bottom: 5px; padding-bottom: 1px;
     - Entry Header (.entry-header):
       - Use CSS Flexbox: display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;
       - Left side (.entry-left): bold organization/project title, followed by italicized role/technologies (e.g., <strong>Credit Risk Predictor</strong> — <em>Python, Scikit-learn, Streamlit</em>).
       - Right side (.entry-right): right-aligned dates / location (e.g., 2023 – Present or Bangalore, India), font-size: 9pt, text-align: right.
     - Sub-entry line (if degree/company on separate line): display: flex; justify-content: space-between; font-style: italic; font-size: 9pt; color: #333; margin-bottom: 3px;
     - Lists (.bullet-list):
       - margin: 2px 0 6px 16px; padding: 0; list-style-type: disc;
       - li: margin-bottom: 2px; font-size: 9.5pt; line-height: 1.25;
     - Technical Skills Section (.skills-group):
       - Line-by-line category format: <strong>Category Name:</strong> Item 1, Item 2, Item 3...
       - Margin between skill lines: 2px 0; font-size: 9.5pt;
     - Page Constraint: Ensure padding/margins are balanced so the content fits cleanly onto EXACTLY ONE A4 page.

     =========================================
     3. OUTPUT REQUIREMENT
     =========================================
     Return ONLY the complete, production-ready HTML document starting with <!DOCTYPE html>.
     Do NOT wrap in JSON. Do NOT include markdown code fences, comments, or extra text before/after the HTML.
     `;

       const maxAttempts = 3;
       let lastError;

       for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
         try {
            const completion=await ai.chat.completions.create({
              model:"openai/gpt-oss-120b",
              messages:[
                 {
                   role: "system",
                   content:"You are an expert resume writer and senior software engineer. Strictly forbid inventing quantitative metrics, percentages, SLAs, latency numbers, throughput, or unverified candidate data. Output ONLY the raw HTML document starting with <!DOCTYPE html>."
                 },
                 {
                   role: "user",
                   content: `${prompt}\n\nThis is generation attempt ${attempt} of ${maxAttempts}. Return the complete document; never stop halfway through the HTML.`
                 }
              ],
              temperature:0.2
            });

            let rawHtml=completion.choices[0].message.content.trim();
            if (rawHtml.startsWith("```")) {
              rawHtml = rawHtml.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();
            }

              const validatedResume = resumePdf.safeParse({ html: rawHtml });
              if (!validatedResume.success) {
                throw new Error("Generated resume HTML failed validation");
              }
              rawHtml = validatedResume.data.html;

            const hasCompleteDocument = /^<!DOCTYPE html>/i.test(rawHtml)
              && /<\/html>\s*$/i.test(rawHtml)
              && /<\/body>/i.test(rawHtml)
              && rawHtml.length >= 1000;
            const sectionCount = (rawHtml.match(/class=["'][^"']*section-heading/gi) || []).length;

            if (!hasCompleteDocument || sectionCount < 2) {
              throw new Error("Generated resume HTML was incomplete");
            }

            return await generatePdfFromHtml(rawHtml);
         }
         catch(error){
             lastError = error;
             console.error(`Resume PDF generation attempt ${attempt}/${maxAttempts} failed:`, error);
         }
       }

       throw new Error(`Resume PDF generation failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
}

module.exports={generateInterviewReport,generateResumePdf}