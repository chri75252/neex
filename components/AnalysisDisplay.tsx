import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import AnalysisSummary from './AnalysisSummary';
import ClauseList from './ClauseList';
import ClauseDetail from './ClauseDetail';
import NegotiationChecklist from './NegotiationChecklist';
import MissingClausesReport from './MissingClausesReport';
import { downloadReport } from '../utils/reportGenerator';

interface AnalysisDisplayProps {
  results: AnalysisResult[];
  missingClausesReport: string | null;
  onReset: () => void;
  isLoading: boolean;
  progress: { current: number; total: number } | null;
  onStop: () => void;
}

type Tab = 'analysis' | 'negotiation' | 'missing';

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ results, missingClausesReport, onReset, isLoading, progress, onStop }) => {
  const [selectedClauseIndex, setSelectedClauseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('analysis');

  const selectedClause = results[selectedClauseIndex];
  
  const handleSelectClause = (index: number) => {
    if(index < results.length) {
      setSelectedClauseIndex(index);
    }
  }

  const TabButton: React.FC<{tabName: Tab, children: React.ReactNode, disabled?: boolean}> = ({ tabName, children, disabled }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      disabled={disabled}
      className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
        activeTab === tabName
          ? 'bg-brand-secondary text-white'
          : 'bg-transparent text-brand-text-secondary hover:bg-brand-light/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-current={activeTab === tabName ? 'page' : undefined}
    >
      {children}
    </button>
  );

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Analysis Report</h2>
                <p className="text-brand-text-secondary mt-1">
                    {isLoading ? 'Analysis in progress...' : 'A comprehensive review based on the NEEX Blueprint.'}
                </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                {isLoading && (
                   <button
                    onClick={onStop}
                    className="bg-risk-critical hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Stop Analysis
                  </button>
                )}
                <button
                    onClick={() => downloadReport(results, 'md')}
                    disabled={isLoading || results.length === 0}
                    className="bg-brand-light hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Download MD
                </button>
                 <button
                    onClick={() => downloadReport(results, 'json')}
                    disabled={isLoading || results.length === 0}
                    className="bg-brand-light hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Download JSON
                </button>
                <button
                    onClick={onReset}
                    disabled={isLoading}
                    className="bg-brand-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Analyze New Contract
                </button>
            </div>
      </div>
      
      {isLoading && progress && (
        <div className="my-6">
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

      <AnalysisSummary results={results} />

      <div className="mt-8">
        <div className="border-b border-brand-light">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton tabName="analysis">Clause Analysis</TabButton>
            <TabButton tabName="negotiation" disabled={isLoading}>Negotiation Checklist</TabButton>
            <TabButton tabName="missing" disabled={isLoading}>Missing Clauses Report</TabButton>
          </nav>
        </div>

        <div className="mt-6">
            {activeTab === 'analysis' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                    <ClauseList
                        results={results}
                        selectedIndex={selectedClauseIndex}
                        onSelectClause={handleSelectClause}
                    />
                    </div>
                    <div className="lg:col-span-2">
                    {selectedClause ? (
                         <ClauseDetail result={selectedClause} />
                    ) : (
                        <div className="bg-brand-secondary rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                            <p className="text-brand-text-secondary text-lg">
                                {isLoading ? 'Awaiting first clause analysis...' : 'No clause selected.'}
                            </p>
                        </div>
                    )}
                    </div>
                </div>
            )}
            {activeTab === 'negotiation' && !isLoading && (
                <NegotiationChecklist results={results} />
            )}
            {activeTab === 'missing' && !isLoading && (
                <MissingClausesReport report={missingClausesReport} />
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;