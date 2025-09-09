import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type, GenerateContentResponse } from "@google/genai";
import OpenAI from 'openai';
import type { AnalysisResult, ClauseTag, AppConfig, AIProvider } from '../types';

// --- SHARED SCHEMA ---

const clauseAnalysisSchemaForGemini = {
    type: Type.OBJECT,
    properties: {
        interpretation: { type: Type.STRING, description: "A neutral, technical explanation of what the clause enables or controls. What does it do?" },
        exposure: { type: Type.STRING, description: "An analysis of potential vulnerabilities, risks, or liabilities for the organization reviewing the contract. Where could this clause cause problems?" },
        opportunity: { type: Type.STRING, description: "An analysis of potential leverage, negotiation hooks, or remedies available. How can this clause be used to our advantage or improved?" },
        clauseTag: { type: Type.STRING, description: "Classify the clause using ONE of the following 10 tags: TEC, LEG, FIN, COM, IPX, TRM, DIS, DOC, EXE, EXT." },
        riskScore: { type: Type.STRING, enum: ["Critical", "Material", "Procedural"], description: "Assign a risk score from one of the 3 tiers." },
        riskCategories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List all applicable risk categories from: Financial, Legal, Operational, Compliance, Reputational, Strategic." },
        negotiationRecommendation: { type: Type.STRING, description: "Provide a concise, actionable recommendation for negotiation. E.g., 'Suggest adding a cap on liability'." },
        aiInvestigatoryQuestion: { type: Type.STRING, description: "An insightful, probing question an analyst should ask to uncover hidden risks. E.g., 'Does 'best efforts' have a measurable definition?'" },
        suggestedRedline: { type: Type.STRING, description: "If a change is recommended, provide the re-written clause as a 'redline'. If no change is needed, return an empty string." }
    },
    required: ["interpretation", "exposure", "opportunity", "clauseTag", "riskScore", "riskCategories", "negotiationRecommendation", "aiInvestigatoryQuestion", "suggestedRedline"]
};

// --- HELPER FUNCTIONS ---

function cleanJsonResponse(responseText: string): string {
    // Remove markdown formatting that some models add
    let cleaned = responseText.trim();
    
    // Remove ```json and ``` markers
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '');
    }
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '');
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/\s*```$/, '');
    }
    
    return cleaned.trim();
}

// --- ABORTABLE RETRY LOGIC ---

async function withRetry<T>(
    fn: () => Promise<T>,
    signal: AbortSignal,
    maxRetries = 3,
    initialDelay = 1000
): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < maxRetries; i++) {
        if (signal.aborted) throw new DOMException('Request aborted by user', 'AbortError');
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (i < maxRetries - 1) {
                 console.warn(`API call attempt ${i + 1} failed. Retrying in ${initialDelay * (2 ** i)}ms...`, lastError);
                await new Promise(resolve => setTimeout(resolve, initialDelay * (2 ** i)));
            }
        }
    }
    throw lastError ?? new Error("API call failed after multiple retries.");
}

// --- PROVIDER-SPECIFIC IMPLEMENTATIONS ---

const getModelName = (provider: AIProvider, config: AppConfig): string => {
    if (config.model) return config.model;
    switch (provider) {
        case 'gemini': return 'gemini-2.5-flash';
        case 'openai': return 'gpt-4o';
        case 'openrouter': return 'openai/gpt-4o';
        default: throw new Error(`Unknown provider: ${provider}`);
    }
};

// --- Gemini Implementation ---

async function geminiSplitContract(contractText: string, config: AppConfig, signal: AbortSignal): Promise<string[]> {
    if (!config.geminiApiKey) throw new Error("Gemini API Key is not set.");
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const response = await ai.models.generateContent({
        model: getModelName('gemini', config),
        contents: `Given the following legal contract, split it into individual clauses. A clause is typically a numbered or lettered paragraph. Return the result as a JSON object with a single key "clauses" which is an array of strings, where each string is a complete clause.\n\nContract:\n${contractText}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { clauses: { type: Type.ARRAY, items: { type: Type.STRING } } },
                required: ["clauses"]
            }
        }
    });

    const jsonResponse = JSON.parse(response.text);
    if (jsonResponse && Array.isArray(jsonResponse.clauses)) {
        return jsonResponse.clauses.filter(c => c.trim().length > 10);
    }
    throw new Error("Invalid format from Gemini for clause splitting.");
}

async function geminiAnalyzeClause(clauseText: string, config: AppConfig, signal: AbortSignal): Promise<Omit<AnalysisResult, 'clause'>> {
    if (!config.geminiApiKey) throw new Error("Gemini API Key is not set.");
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const response = await ai.models.generateContent({
        model: getModelName('gemini', config),
        contents: `Analyze the following contract clause according to the NEEX Legal Contract Review Blueprint. Your response MUST be a single JSON object that conforms to the provided schema. Do not include any markdown formatting.\n\nClause to Analyze: "${clauseText}"`,
        config: {
            systemInstruction: "You are a world-class legal AI assistant specializing in contract review following the NEEX Blueprint. You must perform a comprehensive analysis based on Interpretation (what it does), Exposure (risks), and Opportunity (leverage). You must also formulate an 'AI Investigatory Question' and a 'Suggested Redline' if needed.",
            responseMimeType: "application/json",
            responseSchema: clauseAnalysisSchemaForGemini,
            safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }]
        }
    });
    
    const jsonResponse = JSON.parse(response.text);
    if (jsonResponse && jsonResponse.interpretation) {
        return jsonResponse as Omit<AnalysisResult, 'clause'>;
    }
    throw new Error("Gemini response is missing required fields.");
}

async function geminiGenerateMissingReport(clauseTags: ClauseTag[], config: AppConfig, signal: AbortSignal): Promise<string> {
    if (!config.geminiApiKey) throw new Error("Gemini API Key is not set.");
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const prompt = `Based on the NEEX Legal Contract Review Blueprint, a contract has been analyzed and found to contain clauses with the following tags: ${JSON.stringify(clauseTags)}.

The blueprint's modular checklist for a standard Service & Deliverables contract includes:
- BASE: Scope (TEC), Standards (TEC), Deliverables (TEC), Payment (FIN), Term (TRM), Termination (TRM), Breach (TRM).
- RISK: Indemnification (LEG), Liability Limits (LEG), Warranties (LEG).
- OWNERSHIP: IP Assignment (IPX), Confidentiality (COM).
- LEGAL: Compliance (COM), Governing Law (DIS), Dispute Resolution (DIS).

Analyze the provided tags and identify which key components seem to be missing. For each missing component, explain the risk of its absence. Respond in markdown. If it looks comprehensive, state that.`;

    const response = await ai.models.generateContent({
        model: getModelName('gemini', config),
        contents: prompt
    });
    return response.text;
}


// --- OpenAI / OpenRouter Implementation ---

async function openAILikeSplitContract(contractText: string, config: AppConfig, signal: AbortSignal): Promise<string[]> {
    const provider = config.provider;
    const apiKey = provider === 'openai' ? config.openaiApiKey : config.openrouterApiKey;
    if (!apiKey) throw new Error(`${provider} API Key is not set.`);
    
    const openai = new OpenAI({
        apiKey,
        baseURL: provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined,
        dangerouslyAllowBrowser: true,
    });
    
    const prompt = `Given the following legal contract, split it into individual clauses. A clause is typically a numbered or lettered paragraph. Return the result as a JSON object with a single key "clauses" which is an array of strings, where each string is a complete clause.\n\nContract:\n${contractText}`;
    
    const chatCompletion = await openai.chat.completions.create({
        model: getModelName(provider, config),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    }, { signal });

    const responseText = chatCompletion.choices[0].message.content ?? '{}';
    const cleanedResponse = cleanJsonResponse(responseText);
    const jsonResponse = JSON.parse(cleanedResponse);
    if (jsonResponse && Array.isArray(jsonResponse.clauses)) {
        return jsonResponse.clauses.filter(c => c.trim().length > 10);
    }
    throw new Error(`Invalid format from ${provider} for clause splitting response.`);
}

async function openAILikeAnalyzeClause(clauseText: string, config: AppConfig, signal: AbortSignal): Promise<Omit<AnalysisResult, 'clause'>> {
    const provider = config.provider;
    const apiKey = provider === 'openai' ? config.openaiApiKey : config.openrouterApiKey;
    if (!apiKey) throw new Error(`${provider} API Key is not set.`);
    
    const openai = new OpenAI({
        apiKey,
        baseURL: provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined,
        dangerouslyAllowBrowser: true,
    });

    const userPrompt = `Analyze the following contract clause according to the NEEX Legal Contract Review Blueprint. Your response MUST be a single JSON object with these exact fields:

{
  "interpretation": "A neutral, technical explanation of what the clause enables or controls",
  "exposure": "An analysis of potential vulnerabilities, risks, or liabilities", 
  "opportunity": "An analysis of potential leverage, negotiation hooks, or remedies available",
  "clauseTag": "ONE of: TEC, LEG, FIN, COM, IPX, TRM, DIS, DOC, EXE, EXT",
  "riskScore": "ONE of: Critical, Material, Procedural",
  "riskCategories": ["Array of: Financial, Legal, Operational, Compliance, Reputational, Strategic"],
  "negotiationRecommendation": "Concise, actionable recommendation for negotiation",
  "aiInvestigatoryQuestion": "Insightful, probing question an analyst should ask",
  "suggestedRedline": "Re-written clause if changes recommended, or empty string if none"
}

Clause to Analyze: "${clauseText}"`;
    const systemInstruction = "You are a world-class legal AI assistant specializing in contract review following the NEEX Blueprint. Return ONLY valid JSON with no additional formatting, markdown, or explanation. Do not wrap the JSON in code blocks.";

    const chatCompletion = await openai.chat.completions.create({
        model: getModelName(provider, config),
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
    }, { signal });

    const responseText = chatCompletion.choices[0].message.content ?? '{}';
    const cleanedResponse = cleanJsonResponse(responseText);
    const jsonResponse = JSON.parse(cleanedResponse);
    if (jsonResponse && jsonResponse.interpretation) {
        return jsonResponse as Omit<AnalysisResult, 'clause'>;
    }
    throw new Error(`AI response from ${provider} is missing required fields.`);
}

async function openAILikeGenerateMissingReport(clauseTags: ClauseTag[], config: AppConfig, signal: AbortSignal): Promise<string> {
    const provider = config.provider;
    const apiKey = provider === 'openai' ? config.openaiApiKey : config.openrouterApiKey;
    if (!apiKey) throw new Error(`${provider} API Key is not set.`);
    
    const openai = new OpenAI({
        apiKey,
        baseURL: provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined,
        dangerouslyAllowBrowser: true,
    });
    
    const prompt = `Based on the NEEX Legal Contract Review Blueprint, a contract has been analyzed and found to contain clauses with the following tags: ${JSON.stringify(clauseTags)}.

The blueprint's modular checklist for a standard Service & Deliverables contract includes:
- BASE: Scope (TEC), Standards (TEC), Deliverables (TEC), Payment (FIN), Term (TRM), Termination (TRM), Breach (TRM).
- RISK: Indemnification (LEG), Liability Limits (LEG), Warranties (LEG).
- OWNERSHIP: IP Assignment (IPX), Confidentiality (COM).
- LEGAL: Compliance (COM), Governing Law (DIS), Dispute Resolution (DIS).

Analyze the provided tags and identify which key components seem to be missing. For each missing component, explain the risk of its absence. Respond in markdown. If it looks comprehensive, state that.`;

    const chatCompletion = await openai.chat.completions.create({
        model: getModelName(provider, config),
        messages: [{ role: "user", content: prompt }],
    }, { signal });

    return chatCompletion.choices[0].message.content ?? 'Report generation failed.';
}


// --- ROUTER FUNCTIONS ---

async function splitContractIntoClauses(contractText: string, config: AppConfig, signal: AbortSignal): Promise<string[]> {
    switch (config.provider) {
        case 'gemini':
            return geminiSplitContract(contractText, config, signal);
        case 'openai':
        case 'openrouter':
            return openAILikeSplitContract(contractText, config, signal);
        default:
            throw new Error(`Unsupported provider for splitting: ${config.provider}`);
    }
}

async function analyzeClause(clauseText: string, config: AppConfig, signal: AbortSignal): Promise<Omit<AnalysisResult, 'clause'>> {
    switch (config.provider) {
        case 'gemini':
            return geminiAnalyzeClause(clauseText, config, signal);
        case 'openai':
        case 'openrouter':
            return openAILikeAnalyzeClause(clauseText, config, signal);
        default:
            throw new Error(`Unsupported provider for analysis: ${config.provider}`);
    }
}


// --- PUBLIC API FUNCTIONS ---

export async function performFullAnalysis(
    contractText: string,
    config: AppConfig,
    onProgressUpdate: (progress: { current: number, total: number }) => void,
    onClauseAnalyzed: (result: AnalysisResult) => void,
    signal: AbortSignal
): Promise<AnalysisResult[]> {
    const clauses = await withRetry(() => splitContractIntoClauses(contractText, config, signal), signal);
    if (signal.aborted) throw new DOMException('Analysis aborted.', 'AbortError');
    if (clauses.length === 0) throw new Error("No clauses were identified in the provided text.");

    onProgressUpdate({ current: 0, total: clauses.length });
    
    const analysisResults: AnalysisResult[] = [];
    for (let i = 0; i < clauses.length; i++) {
        if (signal.aborted) throw new DOMException('Analysis aborted.', 'AbortError');
        
        const clause = clauses[i];
        const analysisData = await withRetry(() => analyzeClause(clause, config, signal), signal);
        const newResult: AnalysisResult = { clause, ...analysisData };
        
        analysisResults.push(newResult);
        onClauseAnalyzed(newResult);
        onProgressUpdate({ current: i + 1, total: clauses.length });
        
        if (i < clauses.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    return analysisResults;
}

export async function generateMissingClauseReport(clauseTags: ClauseTag[], config: AppConfig, signal: AbortSignal): Promise<string> {
    switch (config.provider) {
        case 'gemini':
            return geminiGenerateMissingReport(clauseTags, config, signal);
        case 'openai':
        case 'openrouter':
            return openAILikeGenerateMissingReport(clauseTags, config, signal);
        default:
            throw new Error(`Unsupported provider for report generation: ${config.provider}`);
    }
}
