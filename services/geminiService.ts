
import { GoogleGenAI, Type } from "@google/genai";
import { PotentialLead, Outreach } from '../types';

const GEMINI_API_KEY = 'AIzaSyCyuoVq33M_ubwcKl8XTsydeiiN2DVBT6k';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
        You are an AI assistant specializing in B2B lead generation, with a mandate for 100% accuracy, using Google Search as your verification tool.
        A user's business is described as: "${businessSummary}". They need qualified leads.
        Find up to ${numberOfLeads} real, existing businesses in the "${targetIndustry}" industry located in or around "${location}".
        ${locationInstruction}

        **Primary Directive:** Prioritize small-to-medium-sized businesses (SMBs) with websites that clearly need improvement (e.g., outdated, not mobile-friendly, poor SEO). Avoid large corporations.

        **Execution Protocol (Follow these steps exactly):**
        1.  **Search & Identify:** Use Google Search for "${targetIndustry} in ${location}". Identify a list of potential SMBs from the results.
        2.  **Verify & Research:** For each potential lead, visit their official website. Use their website and their Google Business Profile to verify all information. Do not use unverified third-party directory sites.
        3.  **Analyze Weaknesses:** Scrutinize the website for specific, actionable flaws relevant to the user's services ("${businessSummary}"). This analysis is critical for the \`justification\`.
        4.  **Format Output:** Compile the verified data into a single, clean JSON array string. No text or markdown outside the JSON.

        **Data Integrity Mandates (CRITICAL - NON-NEGOTIABLE):**
        -   \`name\`: The official, full business name.
        -   \`description\`: A concise, one-sentence summary of the business.
        -   \`address\`: The verified, physical street address from their official site or Google Business Profile.
        -   \`website\`: The full, official, and working website URL. MUST start with http or https. If no website exists, use an empty string.
        -   \`email\`: **THE MOST IMPORTANT RULE.** You are strictly forbidden from inventing, guessing, fabricating, or assuming an email address. You may ONLY return an email address if it is explicitly visible and written on the business's official website (e.g., on a 'Contact Us' page or in the footer). If you cannot find a publicly listed email, the value for this field MUST be an empty string (\`""\`). There are zero exceptions. A fake email invalidates all your work.
        -   \`justification\`: A highly specific, actionable analysis (2-3 sentences) that provides the perfect 'foot-in-the-door' reason for outreach. It must directly connect a tangible weakness on their website to the specific services offered by the user ("${businessSummary}"). Do not be generic. Example: 'Their website lacks a mobile-responsive design, causing a poor user experience on phones. Our web design service can build a modern, mobile-first site to capture more leads.'

        **Final Check:** Before returning the JSON, review every field for every lead to ensure it complies with all Data Integrity Mandates. Accuracy is paramount.
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
        2.  Draft a concise, compelling, and personalized email (under 150 words). The tone should be helpful, not overly salesy. **Use clear formatting with short paragraphs and newlines to ensure it is easy to read.**
            - Start by acknowledging something specific about their business.
            - Introduce your service as the direct solution to the specific pain point identified.
            - Clearly mention your company's name.${customSnippetInstruction}
            - End with a clear, low-friction call to action. ${meetingLink ? `Include this meeting link for them to book a call: ${meetingLink}` : 'Suggest a brief call to discuss further.'}
        3.  **Determine the recipient's email address for the 'suggestedEmail' field.** Use the provided email "${lead.email}" if it exists and is not an empty string. If the provided email is empty (""), you MUST return an empty string "" for the 'suggestedEmail' field. DO NOT under any circumstances invent or suggest a generic email.

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
                        body: { type: Type.STRING, description: "The full, personalized email body. It should be well-formatted with newlines and short paragraphs for maximum readability." },
                        suggestedEmail: { type: Type.STRING, description: "The contact email for the lead, taken from the input. If no email was provided in the input, this MUST be an empty string." }
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