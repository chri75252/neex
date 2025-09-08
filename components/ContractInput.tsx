import React, { useState, useCallback, useRef } from 'react';
import { parseFile } from '../utils/fileParser';
import type { AIProvider } from '../types';

interface ContractInputProps {
  contractText: string;
  setContractText: (text: string) => void;
  handleAnalyze: () => void;
  isLoading: boolean;
  progress: { current: number; total: number } | null;
  error: string | null;
  setError: (error: string | null) => void;
  onStop: () => void;
  availableProviders: AIProvider[];
  selectedProvider: AIProvider | null;
  setSelectedProvider: (provider: AIProvider) => void;
}

const ContractInput: React.FC<ContractInputProps> = ({
  contractText,
  setContractText,
  handleAnalyze,
  isLoading,
  progress,
  error,
  setError,
  onStop,
  availableProviders,
  selectedProvider,
  setSelectedProvider,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;
    if (isLoading || isParsing) return;
    
    setError(null);
    setIsParsing(true);
    setFileName(file.name);

    try {
      const text = await parseFile(file);
      setContractText(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred while parsing the file.';
      setError(message);
      setFileName(null);
      setContractText(''); // Clear text on parsing error
    } finally {
      setIsParsing(false);
    }
  }, [setContractText, setError, isLoading, isParsing]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onUploadClick = () => {
      fileInputRef.current?.click();
  }
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          handleFile(e.target.files[0]);
      }
  }

  const providerNames: Record<AIProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    openrouter: 'OpenRouter',
  };

  return (
    <div className="bg-brand-secondary rounded-lg shadow-lg p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Upload Your Contract</h2>
        <p className="text-brand-text-secondary mt-2">
          Upload a document or paste text below to begin the analysis.
        </p>
      </div>
      
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-brand-accent bg-brand-light/20' : 'border-brand-light hover:border-brand-accent/50'}`}
      >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange}
            className="hidden" 
            accept=".pdf,.docx,.txt"
            disabled={isParsing || isLoading}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <button
            onClick={onUploadClick}
            disabled={isParsing || isLoading}
            className="mt-4 font-semibold text-brand-accent hover:text-blue-400 disabled:text-brand-light disabled:cursor-not-allowed"
          >
            Click to upload a file
          </button>
          <p className="text-sm text-brand-text-secondary mt-1">or drag and drop</p>
          <p className="text-xs text-brand-text-secondary mt-2">Supported formats: PDF, DOCX, TXT</p>
          {isParsing && <p className="mt-4 text-yellow-400">Parsing document: {fileName}...</p>}
          {fileName && !isParsing && contractText && <p className="mt-4 text-green-400">Loaded: {fileName}</p>}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-brand-light"></div>
        </div>
        <div className="relative flex justify-center">
            <span className="bg-brand-secondary px-2 text-sm text-brand-text-secondary">OR</span>
        </div>
      </div>
      
      <textarea
        value={contractText}
        onChange={(e) => {
            setContractText(e.target.value);
            if (fileName) setFileName(null); // Clear file name if user edits text
        }}
        placeholder="Paste your full contract text here..."
        className="w-full h-60 bg-brand-dark border border-brand-light rounded-md p-4 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200 ease-in-out resize-y"
        disabled={isLoading || isParsing}
      />

      <div className="mt-6">
        <label htmlFor="provider-select" className="block text-sm font-medium text-brand-text-secondary mb-2 text-center">
          Select AI Provider
        </label>
        {availableProviders.length > 0 ? (
          <select
            id="provider-select"
            value={selectedProvider ?? ''}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            disabled={isLoading || isParsing}
            className="block w-full max-w-xs mx-auto bg-brand-dark border border-brand-light rounded-md py-2 px-3 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none transition duration-200"
          >
            {availableProviders.map(provider => (
              <option key={provider} value={provider}>{providerNames[provider]}</option>
            ))}
          </select>
        ) : (
          <p className="text-center text-yellow-400 bg-yellow-900/50 p-2 rounded-md">
            No API keys configured. Please add at least one key to the <code>.env.local</code> file.
          </p>
        )}
      </div>

      {error && <div className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      <div className="mt-6 flex justify-center items-center gap-4">
        {isLoading ? (
          <>
            <button
              disabled
              className="w-full md:w-auto bg-brand-light cursor-wait text-white font-bold py-3 px-12 rounded-lg"
            >
              Analyzing...
            </button>
            <button
              onClick={onStop}
              className="w-full md:w-auto bg-risk-critical hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={isParsing || !contractText.trim() || availableProviders.length === 0}
            className="w-full md:w-auto bg-brand-accent hover:bg-blue-500 disabled:bg-brand-light disabled:cursor-not-allowed text-white font-bold py-3 px-12 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-accent"
          >
            {isParsing ? 'Processing...' : 'Analyze Contract'}
          </button>
        )}
      </div>

      {isLoading && progress && (
        <div className="mt-6">
            <p className="text-center text-brand-text-secondary mb-2">
                {progress.total > 0 ? `Analyzing clause ${progress.current} of ${progress.total}` : 'Identifying clauses...'}
            </p>
            <div className="w-full bg-brand-light rounded-full h-2.5">
                <div 
                    className="bg-brand-accent h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 5}%` }}
                ></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ContractInput;
