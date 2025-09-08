
import React, { useMemo } from 'react';
import type { AnalysisResult } from '../types';
import type { RiskLevel } from '../types';

interface SummaryCardProps {
    level: RiskLevel;
    count: number;
    icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ level, count, icon }) => {
    const colors: Record<RiskLevel, string> = {
        'Critical': 'border-risk-critical/50 text-risk-critical',
        'Material': 'border-risk-material/50 text-risk-material',
        'Procedural': 'border-risk-procedural/50 text-risk-procedural'
    };
    return (
        <div className={`bg-brand-secondary p-4 rounded-lg border-l-4 ${colors[level]} flex items-center justify-between`}>
            <div>
                <p className="text-sm font-medium text-brand-text-secondary">{level} Issues</p>
                <p className="text-3xl font-bold text-white">{count}</p>
            </div>
            <div className="text-3xl opacity-50">{icon}</div>
        </div>
    );
};


interface AnalysisSummaryProps {
  results: AnalysisResult[];
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ results }) => {
  const summary = useMemo(() => {
    return results.reduce((acc, result) => {
      acc[result.riskScore] = (acc[result.riskScore] || 0) + 1;
      return acc;
    }, {} as Record<RiskLevel, number>);
  }, [results]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-secondary p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-brand-text-secondary">Total Clauses</p>
                <p className="text-3xl font-bold text-white">{results.length}</p>
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <SummaryCard 
            level="Critical" 
            count={summary.Critical || 0}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <SummaryCard 
            level="Material" 
            count={summary.Material || 0}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <SummaryCard 
            level="Procedural" 
            count={summary.Procedural || 0}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.105 1.186 19.868 2.185 20.13 4.148l.41 3.061A4.5 4.5 0 0116.25 12H13m-2.257 3.515a4.002 4.002 0 01-4.404.301l-1.637-.818a1.5 1.5 0 00-1.69.24l-1.33 1.154C.91 17.52 1.84 19 3.25 19h5.591a4.5 4.5 0 004.382-3.132l.163-.579z" /></svg>}
        />
    </div>
  );
};

export default AnalysisSummary;
