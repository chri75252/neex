
import React from 'react';
import type { AnalysisResult } from '../types';
import { RISK_LEVEL_COLORS } from '../constants';

interface ClauseListProps {
  results: AnalysisResult[];
  selectedIndex: number;
  onSelectClause: (index: number) => void;
}

const ClauseList: React.FC<ClauseListProps> = ({ results, selectedIndex, onSelectClause }) => {
  return (
    <div className="bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-brand-light">
        <h3 className="text-lg font-bold text-white">Contract Clauses</h3>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <ul>
          {results.map((result, index) => (
            <li key={index}>
              <button
                onClick={() => onSelectClause(index)}
                className={`w-full text-left p-4 border-l-4 transition duration-200 ease-in-out ${
                  selectedIndex === index
                    ? 'bg-brand-accent/20 border-brand-accent'
                    : `bg-brand-secondary border-transparent hover:bg-brand-light`
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-brand-text">Clause {index + 1}</p>
                   <span className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${RISK_LEVEL_COLORS[result.riskScore]}`}>
                        {result.riskScore}
                    </span>
                </div>
                <p className="text-sm text-brand-text-secondary truncate">
                  {result.clause}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClauseList;
