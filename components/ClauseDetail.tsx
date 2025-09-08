
import React from 'react';
import type { AnalysisResult } from '../types';
import { TAG_DEFINITIONS, RISK_LEVEL_COLORS } from '../constants';

interface ClauseDetailProps {
  result: AnalysisResult;
}

const AnalysisSection: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
    <div className="mb-6">
        <div className="flex items-center mb-2">
            <div className="text-brand-accent mr-3">{icon}</div>
            <h4 className="text-lg font-semibold text-brand-text-secondary tracking-wider uppercase">{title}</h4>
        </div>
        <p className="text-brand-text leading-relaxed ml-9">{content}</p>
    </div>
);


const ClauseDetail: React.FC<ClauseDetailProps> = ({ result }) => {
  return (
    <div className="bg-brand-secondary rounded-lg shadow-lg p-6 animate-fade-in-slow">
        <div className="border-b border-brand-light pb-4 mb-4">
            <p className="text-sm text-brand-text-secondary mb-2">Full Clause Text</p>
            <p className="text-brand-text leading-relaxed font-mono text-sm bg-brand-dark p-3 rounded-md">{result.clause}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center">
                <span className="font-bold text-brand-text-secondary mr-2">Risk Score:</span>
                <span className={`px-3 py-1 text-sm font-bold rounded-full text-white ${RISK_LEVEL_COLORS[result.riskScore]}`}>
                    {result.riskScore}
                </span>
            </div>
            <div className="flex items-center">
                <span className="font-bold text-brand-text-secondary mr-2">Clause Tag:</span>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-brand-light text-brand-text">
                    {TAG_DEFINITIONS[result.clauseTag] || result.clauseTag}
                </span>
            </div>
        </div>

        <AnalysisSection 
            title="Interpretation"
            content={result.interpretation}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <AnalysisSection 
            title="Exposure"
            content={result.exposure}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <AnalysisSection 
            title="Opportunity"
            content={result.opportunity}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
        />

        <div className="mb-6">
            <div className="flex items-center mb-2">
                <div className="text-brand-accent mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="text-lg font-semibold text-brand-text-secondary tracking-wider uppercase">AI Investigatory Question</h4>
            </div>
            <p className="text-brand-text leading-relaxed ml-9 italic">"{result.aiInvestigatoryQuestion}"</p>
        </div>
        
        <div className="border-t border-brand-light pt-4 mt-6">
            <h4 className="text-md font-semibold text-brand-text-secondary mb-3">Negotiation Recommendation</h4>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent text-brand-text p-4 rounded-r-lg">
                <p>{result.negotiationRecommendation}</p>
            </div>
        </div>

        {result.suggestedRedline && (
            <div className="mt-6">
                <h4 className="text-md font-semibold text-brand-text-secondary mb-3">Suggested Redline</h4>
                <div className="bg-green-900/50 border-l-4 border-green-400 text-brand-text p-4 rounded-r-lg">
                     <p className="font-mono text-sm whitespace-pre-wrap">{result.suggestedRedline}</p>
                </div>
            </div>
        )}

        <div className="mt-6">
             <h4 className="text-md font-semibold text-brand-text-secondary mb-3">Risk Categories</h4>
             <div className="flex flex-wrap gap-2">
                {result.riskCategories.map(cat => (
                    <span key={cat} className="bg-brand-light text-brand-text text-xs font-medium px-2.5 py-1 rounded-full">
                        {cat}
                    </span>
                ))}
             </div>
        </div>

    </div>
  );
};

export default ClauseDetail;