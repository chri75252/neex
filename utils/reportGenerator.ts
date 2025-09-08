
import type { AnalysisResult } from '../types';

function generateMarkdownReport(results: AnalysisResult[]): string {
    let md = '# NEEX Legal Contract Analysis Report\n\n';

    const summary = results.reduce((acc, result) => {
        acc[result.riskScore] = (acc[result.riskScore] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    md += '## Analysis Summary\n';
    md += `- **Total Clauses Analyzed:** ${results.length}\n`;
    md += `- **Critical Issues:** ${summary.Critical || 0}\n`;
    md += `- **Material Issues:** ${summary.Material || 0}\n`;
    md += `- **Procedural Issues:** ${summary.Procedural || 0}\n\n`;
    md += '---\n\n';

    results.forEach((result, index) => {
        md += `## Clause ${index + 1}: ${result.clauseTag} - ${result.riskScore} Risk\n\n`;
        md += `**Clause Text:**\n`;
        md += `\`\`\`\n${result.clause}\n\`\`\`\n\n`;
        
        md += `### NEEX Analysis\n\n`;
        md += `**1. Interpretation:** ${result.interpretation}\n\n`;
        md += `**2. Exposure (Risk):** ${result.exposure}\n\n`;
        md += `**3. Opportunity (Leverage):** ${result.opportunity}\n\n`;

        md += `### Recommendations & Categorization\n\n`;
        md += `**Negotiation Recommendation:**\n> ${result.negotiationRecommendation}\n\n`;
        if (result.suggestedRedline) {
            md += `**Suggested Redline:**\n`;
            md += `\`\`\`\n${result.suggestedRedline}\n\`\`\`\n\n`;
        }
        md += `**Risk Categories:** ${result.riskCategories.join(', ')}\n\n`;
        md += '---\n\n';
    });

    return md;
}

export function downloadReport(results: AnalysisResult[], format: 'md' | 'json') {
    const content = format === 'md'
        ? generateMarkdownReport(results)
        : JSON.stringify(results, null, 2);
    
    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neex-analysis-report.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}