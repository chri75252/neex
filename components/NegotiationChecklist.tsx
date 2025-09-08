import React from 'react';
import type { AnalysisResult } from '../types';
import { RISK_LEVEL_COLORS } from '../constants';

interface NegotiationChecklistProps {
  results: AnalysisResult[];
}

const NegotiationChecklist: React.FC<NegotiationChecklistProps> = ({ results }) => {
  return (
    <div className="bg-brand-secondary rounded-lg shadow-lg p-6 md:p-8 animate-fade-in-slow">
      <h3 className="text-2xl font-bold text-white mb-4 border-b border-brand-light pb-3">Negotiation Checklist</h3>
      <ul className="space-y-4">
        {results
          .filter(result => result.negotiationRecommendation)
          .map((result, index) => (
          <li key={index} className="bg-brand-dark p-4 rounded-md border-l-4 border-brand-accent shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-brand-text">
                Clause {index + 1}
                </p>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${RISK_LEVEL_COLORS[result.riskScore]}`}>
                    {result.riskScore} Risk
                </span>
            </div>
            <p className="text-sm text-brand-text-secondary mb-3 font-mono bg-black/20 p-2 rounded truncate">{result.clause}</p>
            <div className="bg-brand-accent/10 p-3 rounded-r-md border-l-2 border-brand-accent">
                <p className="text-brand-text">
                <span className="font-bold">Suggestion: </span>{result.negotiationRecommendation}
                </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NegotiationChecklist;
