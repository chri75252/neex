import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { AnalysisResult, AIProvider, AppConfig } from './types';
import { performFullAnalysis, generateMissingClauseReport } from './services/aiService';
import Header from './components/Header';
import ContractInput from './components/ContractInput';
import AnalysisDisplay from './components/AnalysisDisplay';
import { sampleContract } from './constants';

const App: React.FC = () => {
  const [contractText, setContractText] = useState<string>(sampleContract);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [missingClausesReport, setMissingClausesReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // --- Multi-provider state ---
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  
  const availableProviders = useMemo<AIProvider[]>(() => {
    const providers: AIProvider[] = [];
    if (process.env.GEMINI_API_KEY) providers.push('gemini');
    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
    return providers;
  }, []);

  useEffect(() => {
    // Set the first available provider as the default selection.
    if (availableProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(availableProviders[0]);
    }
  }, [availableProviders, selectedProvider]);

  const handleAnalyze = useCallback(async () => {
    if (!contractText.trim()) {
      setError('Contract text cannot be empty.');
      return;
    }
    if (!selectedProvider) {
      setError('Please select an AI provider. You may need to configure an API key in the .env.local file.');
      return;
    }

    const config: AppConfig = {
      provider: selectedProvider,
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.AI_MODEL,
    };

    const controller = new AbortController();
    setAbortController(controller);
    
    setIsLoading(true);
    setError(null);
    setAnalysisResults([]);
    setMissingClausesReport(null);
    setProgress({ current: 0, total: 0});

    try {
      const finalResults = await performFullAnalysis(
        contractText,
        config,
        (update) => setProgress(update),
        (newResult) => {
            setAnalysisResults(prev => [...prev, newResult]);
        },
        controller.signal
      );

      if (finalResults.length > 0) {
        const clauseTags = finalResults.map(r => r.clauseTag);
        const uniqueClauseTags = [...new Set(clauseTags)];
        const report = await generateMissingClauseReport(uniqueClauseTags, config, controller.signal);
        setMissingClausesReport(report);
      }

    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
        setError('Analysis was stopped by the user.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
      setProgress(null);
      setAbortController(null);
    }
  }, [contractText, selectedProvider]);
  
  const handleStopAnalysis = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const resetApp = useCallback(() => {
    setAnalysisResults([]);
    setMissingClausesReport(null);
    setContractText(sampleContract);
    setError(null);
    setProgress(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {analysisResults.length === 0 && !isLoading ? (
          <ContractInput
            contractText={contractText}
            setContractText={setContractText}
            handleAnalyze={handleAnalyze}
            isLoading={isLoading}
            progress={progress}
            error={error}
            setError={setError}
            onStop={handleStopAnalysis}
            availableProviders={availableProviders}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
          />
        ) : (
          <AnalysisDisplay 
            results={analysisResults} 
            missingClausesReport={missingClausesReport}
            onReset={resetApp}
            isLoading={isLoading}
            progress={progress}
            onStop={handleStopAnalysis}
          />
        )}
      </main>
    </div>
  );
};

export default App;
