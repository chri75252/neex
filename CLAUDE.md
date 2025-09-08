# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NEEX Legal Contract Review System is a React + TypeScript application that provides AI-powered legal contract analysis using the NEEX blueprint methodology. It supports multiple AI providers (Google Gemini, OpenAI, OpenRouter) and performs comprehensive clause-by-clause analysis of legal documents.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

1. Copy `.env.local` to create your environment configuration
2. Add API keys for desired AI providers:
   - `GEMINI_API_KEY` - Google Gemini API key
   - `OPENAI_API_KEY` - OpenAI API key  
   - `OPENROUTER_API_KEY` - OpenRouter API key
   - `AI_MODEL` - (Optional) Specific model override

The application will automatically detect which providers are configured and make them available in the UI.

## Architecture Overview

### Core Components Structure
- **Multi-Provider AI Engine**: `services/aiService.ts` handles routing between Google Gemini, OpenAI, and OpenRouter APIs
- **Document Processing**: `utils/fileParser.ts` supports PDF, DOCX, and TXT file parsing
- **Report Generation**: `utils/reportGenerator.ts` creates Markdown and JSON exports
- **Type System**: `types.ts` defines comprehensive TypeScript interfaces for legal analysis

### AI Service Architecture
The AI service implements a provider-agnostic interface with:
- **Router Functions**: Automatically route requests based on selected provider
- **Retry Logic**: Built-in retry mechanism with exponential backoff for API failures
- **Abort Support**: Full AbortController integration for cancellable operations
- **Structured Outputs**: JSON schema enforcement for consistent analysis results

### Analysis Pipeline
1. **Contract Splitting**: AI breaks document into individual clauses
2. **Clause Analysis**: Each clause analyzed for Interpretation, Exposure, Opportunity
3. **Risk Assessment**: Automatic scoring (Critical/Material/Procedural) and categorization
4. **Missing Clause Detection**: Compares against NEEX blueprint checklist

### Legal Analysis Schema
The system enforces a strict analysis structure:
- **ClauseTag**: 10 standardized tags (TEC, LEG, FIN, COM, IPX, TRM, DIS, DOC, EXE, EXT)
- **RiskLevel**: Three-tier scoring (Critical, Material, Procedural)
- **RiskCategories**: Six categories (Financial, Legal, Operational, Compliance, Reputational, Strategic)
- **NEEX Methodology**: Interpretation → Exposure → Opportunity analysis framework

## Key Implementation Notes

### File Processing
- PDF parsing uses `pdfjs-dist` with CDN worker
- DOCX processing requires `mammoth.js` loaded from global window object
- All file parsers return plain text for AI processing

### AI Provider Integration
- Gemini uses structured generation with `@google/genai` SDK
- OpenAI/OpenRouter use chat completions with JSON mode
- Provider selection handled dynamically at runtime
- Model defaults: `gemini-2.5-flash`, `gpt-4o`, `openai/gpt-4o`

### State Management
- Analysis results stored in component state with real-time updates
- Progress tracking with current/total clause counts
- Abort functionality preserves partial results
- Export supports both human-readable (Markdown) and machine-readable (JSON) formats

### Build Configuration
- Vite configuration exposes environment variables to client-side code
- Path alias `@` points to project root for clean imports
- TypeScript with ESNext modules and React JSX transformation