import React from 'react';

interface MissingClausesReportProps {
  report: string | null;
}

const MissingClausesReport: React.FC<MissingClausesReportProps> = ({ report }) => {
  if (!report) {
    return (
        <div className="bg-brand-secondary rounded-lg shadow-lg p-6 animate-fade-in-slow text-center h-64 flex items-center justify-center">
            <p className="text-brand-text-secondary text-lg">Generating Modular Checklist Analysis...</p>
        </div>
    );
  }

  return (
    <div className="bg-brand-secondary rounded-lg shadow-lg p-6 md:p-8 animate-fade-in-slow">
        <h3 className="text-2xl font-bold text-white mb-4 border-b border-brand-light pb-3">Modular Checklist Analysis</h3>
        <div className="text-brand-text leading-relaxed space-y-2">
           {report.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3 border-b border-brand-light pb-2">{line.substring(3)}</h2>
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-semibold text-brand-accent mt-4 mb-2">{line.substring(4)}</h3>
                }
                if (line.startsWith('- **')) {
                    const parts = line.substring(4).split(':**');
                    return (
                        <p key={index} className="my-2">
                            <strong className="font-semibold text-brand-text">{parts[0]}:</strong>
                            <span className="text-brand-text-secondary ml-2">{parts[1]}</span>
                        </p>
                    );
                }
                 if (line.startsWith('- ')) {
                    return (
                        <div key={index} className="flex items-start my-2">
                            <span className="text-brand-accent mr-3 mt-1">&#8227;</span>
                            <span className="text-brand-text-secondary">{line.substring(2)}</span>
                        </div>
                    );
                }
                if (line.trim() === '') {
                    return <div key={index} className="h-2"></div>;
                }
                return <p key={index} className="my-2 text-brand-text-secondary">{line}</p>;
            })}
        </div>
    </div>
  );
};

export default MissingClausesReport;
