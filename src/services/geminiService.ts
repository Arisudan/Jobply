import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface UserProfile {
  name: string;
  skills: string[];
  experienceYears: number;
  preferences: string[];
  biography: string;
  targetCulture: string;
}

export interface JobData {
  id: string;
  company: string;
  title: string;
  description: string;
  requirements: string[];
  culture?: string;
}

export interface MatchAnalysis {
  score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  cultureAlignment: number;
  skillMatch: number;
}

export async function analyzeJobMatch(user: UserProfile, job: JobData): Promise<MatchAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the match between this user profile and job description with high precision.
        
        USER PROFILE:
        Name: ${user.name}
        Skills: ${user.skills.join(', ')}
        Total Years of Experience: ${user.experienceYears}
        Preferences: ${user.preferences.join(', ')}
        Self-Bio: ${user.biography}
        Ideal Company Culture: ${user.targetCulture}

        JOB DESCRIPTION:
        Company: ${job.company}
        Title: ${job.title}
        Description: ${job.description}
        Explicit Requirements: ${job.requirements.join(', ')}
        Stated Culture: ${job.culture || 'Not specified'}

        Evaluation Protocol:
        1. **Skill Match**: Mapping user skills to both explicit requirements and implicit needs in the JD.
        2. **Experience Parity**: Compare the user's ${user.experienceYears} years of experience against the implied or explicit seniority of the role. Be critical if the user is significantly under or over-qualified.
        3. **Cultural Resonance**: Measure how well the user's "Ideal Culture" (${user.targetCulture}) aligns with the company's "Stated Culture" (${job.culture}).
        
        Output a detailed analysis including a reasoning string that explains the decision.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Overall match score from 0 to 100" },
            reasoning: { type: Type.STRING, description: "Brief summary of the match" },
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive alignment points" },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential gaps or concerns" },
            cultureAlignment: { type: Type.NUMBER, description: "Culture fit score from 0 to 100" },
            skillMatch: { type: Type.NUMBER, description: "Skill fit score from 0 to 100" },
          },
          required: ["score", "reasoning", "pros", "cons", "cultureAlignment", "skillMatch"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini Match Analysis Error:", error);
    return {
      score: 50,
      reasoning: "Analysis temporarily unavailable. Using fallback scoring.",
      pros: ["System match active"],
      cons: ["AI analysis failed"],
      cultureAlignment: 50,
      skillMatch: 50
    };
  }
}
