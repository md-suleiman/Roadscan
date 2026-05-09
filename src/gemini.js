import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI("PASTE-YOUR-GEMINI-KEY-HERE")

export const generateReport = async (potholes) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const severe = potholes.filter(p => p.severity > 20).length
  const moderate = potholes.filter(p => p.severity > 15 && p.severity <= 20).length
  const minor = potholes.filter(p => p.severity <= 15).length

  const prompt = `
    You are a municipal road repair assistant.
    Analyse this pothole detection data and generate a clear repair priority report:

    Total potholes detected: ${potholes.length}
    Severe potholes: ${severe}
    Moderate potholes: ${moderate}
    Minor potholes: ${minor}

    Generate a plain language repair priority report with:
    1. Overall road condition summary
    2. Urgent repair recommendations
    3. Estimated repair sequence
    Keep it simple and actionable for municipal authorities.
  `

  const result = await model.generateContent(prompt)
  return result.response.text()
}
