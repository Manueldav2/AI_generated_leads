import { GoogleGenAI, Type } from "@google/genai";
import { PotentialLead, Outreach } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeBusiness(description: string, pdfText: string, url: string): Promise<string> {
    const prompt = `
        You are an expert business analyst. Based on the following information about a business, 
        summarize its core services, target audience, and unique value proposition in a concise paragraph of 2-3 sentences.
        This summary will be used to find potential clients.

        Business Description: "${description}"
        Additional Information from uploaded file: "${pdfText}"
        Business Website: "${url}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error in analyzeBusiness:", error);
        throw new Error("Failed to analyze the business profile with AI.");
    }
}


export async function findLeads(businessSummary: string, targetIndustry: string, location: string, numberOfLeads: number): Promise<PotentialLead[]> {
    const locationInstruction = numberOfLeads > 5 
        ? `Since a higher number of leads (${numberOfLeads}) was requested, you MUST expand your search to include nearby towns and suburbs around "${location}" to find enough quality prospects.`
        : `Focus your search primarily within "${location}".`;

    const prompt = `
        You are an AI assistant specializing in B2B lead generation, and you have access to Google Search.
        A user's business is described as: "${businessSummary}". This user is looking for clients.
        The user wants to find real, existing businesses in the "${targetIndustry}" industry.
        ${locationInstruction}

        **Primary Goal: Find small-to-medium-sized businesses (SMBs) that have a clear, demonstrable need for website improvements or digital marketing. Avoid large corporations or franchises.**

        **Your task is to use Google Search to find up to ${numberOfLeads} real local businesses that are strong potential clients.**

        Follow these steps:
        1.  Perform a Google Search for "${targetIndustry} in ${location}" and surrounding areas if needed.
        2.  From the search results, identify up to ${numberOfLeads} actual SMBs. Verify they are real businesses with a physical presence.
        3.  For each business, find its official website.
        4.  **Carefully inspect their website (e.g., contact page, footer) to find a real, public-facing contact email address.**
        5.  **Perform a deep analysis of each lead's website.** Based on the user's services ("${businessSummary}"), identify specific, actionable pain points. Look for things like:
            - Outdated Design, Poor SEO, Lack of Mobile Responsiveness, No Clear Call-to-Action, Slow Loading Speed, or Missing Key Features.
        6.  This detailed analysis is the most critical part of your task. It will form the justification.
        
        **CRITICAL**: You MUST format your final response as a single, clean JSON array string. Do not include any text, markdown formatting, or explanations outside of the JSON.

        The JSON output must be an array of objects, where each object has the following properties:
        - "name": The full name of the business.
        - "description": A brief, one-sentence description of what the business does.
        - "address": The physical address of the business.
        - "website": The full, official website URL (e.g., "https://www.example.com"). If no website exists, provide an empty string.
        - "email": The real contact email address you found on their website. If you cannot find one after a thorough search, provide an empty string "".
        - "justification": **A detailed analysis (2-3 sentences)** of why this business is a good lead, based on the specific pain points you identified in your website analysis (e.g., "Their website uses a very dated design that is not mobile-friendly. It also lacks a clear call-to-action for booking appointments.").
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        
        const jsonText = response.text.trim();
        // The model can sometimes wrap its response in markdown or have leading/trailing text.
        // This regex will find the content between the first '[' and the last ']'.
        const jsonMatch = jsonText.match(/(\[.*\])/s);

        if (!jsonMatch) {
            console.error("No valid JSON array found in the model's response:", jsonText);
            throw new Error("The AI returned a response that was not in the expected JSON format.");
        }

        return JSON.parse(jsonMatch[0]) as PotentialLead[];

    } catch (error) {
        console.error("Error in findLeads:", error);
        throw new Error("Failed to find real leads with AI. The search might not have returned viable results or the format was unexpected.");
    }
}


export async function draftOutreach(businessSummary: string, lead: PotentialLead, businessUrl: string, meetingLink?: string, customSnippet?: string): Promise<Outreach> {
    const customSnippetInstruction = customSnippet 
        ? `\n- **Crucially, you must naturally integrate the following point into the email to make your offer more compelling: "${customSnippet}"` 
        : '';
    
    const prompt = `
        You are a professional B2B sales copywriter drafting a personalized cold outreach email.

        Your Company (Sender): Offers services based on this summary: "${businessSummary}". The company's website is ${businessUrl}.
        The Prospect (Recipient): Is "${lead.name}", a business described as: "${lead.description}". Their website is ${lead.website}, and a potential contact email we found is "${lead.email}".
        The specific reason we are contacting them is: ${lead.justification}.

        Your Task:
        1.  Use the specific justification ("${lead.justification}") as the primary pain point to address in the email.
        2.  Draft a concise, compelling, and personalized email (under 150 words). 
            - Start by acknowledging something about their business.
            - Introduce your service as the direct solution to the specific pain point identified.
            - Clearly mention your company's name.${customSnippetInstruction}
            - End with a clear, low-friction call to action. ${meetingLink ? `Include this meeting link for them to book a call: ${meetingLink}` : 'Suggest a brief call to discuss further.'}
        3.  **Determine the recipient's email address for the 'suggestedEmail' field.** Use the provided email "${lead.email}" if it exists and looks valid. If it is empty, then and only then should you suggest a generic email based on the prospect's website domain (${lead.website}), using prefixes like 'info', 'contact', or 'hello'.

        Do not use placeholders like [Your Name]. The email should be ready to send, signed off generically.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING, description: "A compelling email subject line." },
                        body: { type: Type.STRING, description: "The full, personalized email body, formatted with newlines." },
                        suggestedEmail: { type: Type.STRING, description: "The suggested contact email address for the lead." }
                    },
                    required: ["subject", "body", "suggestedEmail"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Outreach;
    } catch (error) {
        console.error("Error in draftOutreach:", error);
        throw new Error(`Failed to draft outreach for ${lead.name}.`);
    }
}