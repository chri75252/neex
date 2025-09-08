// Defines the possible AI service providers the application can use.
export type AIProvider = 'gemini' | 'openai' | 'openrouter';

// Defines the structure for the application's configuration,
// holding API keys and an optional model name.
export interface AppConfig {
    provider: AIProvider;
    geminiApiKey?: string;
    openaiApiKey?: string;
    openrouterApiKey?: string;
    model?: string;
}

// Defines the different levels of risk that can be assigned to a clause.
export type RiskLevel = 'Critical' | 'Material' | 'Procedural';

// Defines the tags used to categorize legal clauses.
export type ClauseTag = 'TEC' | 'LEG' | 'FIN' | 'COM' | 'IPX' | 'TRM' | 'DIS' | 'DOC' | 'EXE' | 'EXT';

// Defines the broader categories of risk.
export type RiskCategory = 'Financial' | 'Legal' | 'Operational' | 'Compliance' | 'Reputational' | 'Strategic';

// Defines the structure for the complete analysis of a single contract clause.
export interface AnalysisResult {
  clause: string;
  interpretation: string;
  exposure: string;
  opportunity: string;
  clauseTag: ClauseTag;
  riskScore: RiskLevel;
  riskCategories: RiskCategory[];
  negotiationRecommendation: string;
  aiInvestigatoryQuestion: string;
  suggestedRedline: string;
}
