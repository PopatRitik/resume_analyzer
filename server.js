const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

app.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    const { jobRole, jobDescription } = req.body;

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const resumeContentBuffer = fs.readFileSync(req.file.path);
    const resumeContent = await pdfParse(resumeContentBuffer);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      I have a resume and I'm interested in a ${jobRole} position. 
      Here is the job description:
      ${jobDescription}
      
      Here's the content of my resume:
      ${resumeContent.text}

      Please analyze my resume and provide suggestions on how to improve it for a ${jobRole} position. 
      Include recommendations on:
      1. Skills to highlight or add
      2. Experience to emphasize
      3. Any missing relevant information
      4. Grammatical errors and spelling mistakes
      5. Keywords to include for ATS optimization
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;

    fs.unlinkSync(req.file.path);

    res.json({ suggestions: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
