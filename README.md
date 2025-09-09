

# NEEX Legal Contract Review System

The NEEX Legal Contract Review System is an advanced, AI-powered tool designed to de-risk legal contracts by implementing the comprehensive NEEX blueprint methodology. It performs a deep, clause-by-clause analysis, identifies potential risks, and provides actionable negotiation recommendations to protect your interests.

This version has been architected for flexibility, supporting multiple leading AI providers: **Google Gemini**, **OpenAI**, and **OpenRouter.ai**.

---

## ✨ Core Features

This tool goes beyond simple contract summaries, providing a multi-layered analysis for legal professionals and business stakeholders.

-   **Multi-Provider AI Engine**: Seamlessly switch between Google Gemini, OpenAI, and OpenRouter.ai to leverage the best model for your needs.
-   **Deep Clause-by-Clause Analysis**: Each clause is broken down according to the NEEX blueprint's three critical layers:
    -   **Interpretation**: A neutral explanation of what the clause does.
    -   **Exposure**: An analysis of potential risks, liabilities, and vulnerabilities.
    -   **Opportunity**: Identification of negotiation hooks and points of leverage.
-   **Automated Risk Assessment**: Clauses are automatically scored with a risk level (**Critical**, **Material**, **Procedural**) and tagged with relevant risk categories (e.g., Financial, Legal, IPX).
-   **Actionable Negotiation Support**:
    -   **Negotiation Checklist**: A consolidated view of all AI-generated negotiation recommendations.
    -   **Suggested Redlines**: For high-risk clauses, the AI proposes improved, rewritten text to enhance clarity and defensibility.
-   **Modular Checklist Analysis**: The system audits the contract's structure against the NEEX blueprint, generating a report on potentially missing critical clauses (e.g., Indemnification, Limitation of Liability) and the risks of their absence.
-   **Flexible Document Handling**: Analyze contracts by pasting raw text or by uploading files (**PDF**, **DOCX**, **TXT**).
-   **Interactive & Resilient UI**:
    -   View analysis results in **real-time** as they are generated.
    -   **Stop** an analysis at any time without losing the progress already made.
-   **Exportable Reports**: Download the complete analysis report in **Markdown** for documentation or **JSON** for data integration.

---

## 🚀 How It Works

The application provides a streamlined workflow for comprehensive contract review:

1.  **Configure**: Set up your API keys in the `.env.local` file.
2.  **Upload or Paste**: Upload a contract document or paste the text directly into the editor.
3.  **Select Provider**: Choose your preferred AI provider (Gemini, OpenAI, etc.) from the dropdown menu.
4.  **Analyze**: Click "Analyze Contract" to start the process. The system splits the document into clauses and sends each one for deep analysis.
5.  **Review in Real-Time**: Watch as the results populate the dashboard, clause by clause.
6.  **Explore the Report**:
    -   Click through the **Clause List** to see detailed analysis for each section.
    -   Switch to the **Negotiation Checklist** tab for a high-level overview of action items.
    -   Check the **Missing Clauses Report** to identify structural gaps in the contract.
7.  **Download**: Export the full report for offline use.

---

## 🛠️ Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/neex-legal-review.git
cd neex-legal-review
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys
Create a new file named `.env.local` in the root of the project by copying the example file.

```bash
cp .env.local.example .env.local
```

Open `.env.local` with a text editor and add your API keys for the services you wish to use. The UI will automatically detect which providers are configured.

```env
# .env.local

#Environment variables for NEEX Legal Contract Review System
#--- Instructions ---
#1. FILL IN API KEYS: Provide the API keys for the services you want to use.
#You can fill in one, two, or all three. The application will let you choose which one to use.
#2. (Optional) SET A DEFAULT MODEL: If you want to use a specific model, set the AI_MODEL variable.
#If you leave it blank, the system will use a powerful default model for your chosen provider.
#--- Google Gemini Configuration ---
#Your secret API key for Google Gemini.
#GEMINI_API_KEY=
#GEMINI_ALLOWED_MODELS=

# --- OpenAI Configuration ---
# Your secret API key for OpenAI.
OPENAI_API_KEY=
OPENAI_ALLOWED_MODELS=gpt-5-mini

#--- OpenRouter Configuration ---
#Your secret API key for OpenRouter.ai.
#OPENROUTER_API_KEY=
#AI_MODEL=deepseek/deepseek-chat-v3.1:free

### 4. Run the Application
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 💻 Technology Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS
-   **AI Integration**: `@google/genai`, `openai`
-   **Document Parsing**: `pdf.js`, `mammoth.js`

---

## 📁 Project Structure

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   ├── services/         # AI provider logic (aiService.ts)
│   ├── utils/            # Helper functions (file parsing, report generation)
│   ├── App.tsx           # Main application component
│   └── types.ts          # TypeScript type definitions
├── .env.local.example    # Example environment file
├── vite.config.ts        # Vite build configuration
└── README.md             # You are here!
```
