
import type { RiskLevel, ClauseTag, RiskCategory } from './types';

export const RISK_LEVELS: RiskLevel[] = ['Critical', 'Material', 'Procedural'];
export const CLAUSE_TAGS: ClauseTag[] = ['TEC', 'LEG', 'FIN', 'COM', 'IPX', 'TRM', 'DIS', 'DOC', 'EXE', 'EXT'];
export const RISK_CATEGORIES: RiskCategory[] = ['Financial', 'Legal', 'Operational', 'Compliance', 'Reputational', 'Strategic'];

export const TAG_DEFINITIONS: Record<ClauseTag, string> = {
    TEC: "Technical",
    LEG: "Legal",
    FIN: "Financial",
    COM: "Commercial",
    IPX: "Intellectual Property",
    TRM: "Termination",
    DIS: "Dispute Resolution",
    DOC: "Documentation",
    EXE: "Execution",
    EXT: "Exhibits/Appendices",
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
    'Critical': 'bg-risk-critical',
    'Material': 'bg-risk-material',
    'Procedural': 'bg-risk-procedural'
};

export const sampleContract = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is made and entered into as of October 26, 2023 ("Effective Date"), by and between Acme Corporation ("Client"), and Innovate Solutions LLC ("Provider").

1. SERVICES.
Provider agrees to perform web development services as described in Exhibit A ("Services"). The Provider shall complete the Services by December 31, 2024. Any changes to the scope of Services must be agreed upon in a written amendment signed by both parties.

2. PAYMENT.
Client shall pay Provider a total fee of $50,000, payable in installments. A non-refundable deposit of $10,000 is due upon signing. Final payment is due upon successful deployment of the web application. Late payments will incur a penalty of 5% per month.

3. INTELLECTUAL PROPERTY.
Upon full payment, Provider grants Client a perpetual, worldwide license to use the developed software. Provider retains ownership of all pre-existing tools, libraries, and code ("Provider's IP"). Client shall not reverse-engineer any part of Provider's IP.

4. CONFIDENTIALITY.
Both parties agree to keep confidential all non-public information obtained during the course of this Agreement. This obligation shall survive the termination of this Agreement for a period of three (3) years.

5. TERMINATION.
Either party may terminate this Agreement with 30 days written notice if the other party breaches any material term. Client shall pay for all Services rendered up to the date of termination.

6. LIMITATION OF LIABILITY.
IN NO EVENT SHALL PROVIDER'S TOTAL LIABILITY EXCEED THE TOTAL AMOUNT PAID BY CLIENT UNDER THIS AGREEMENT. THIS LIMITATION APPLIES REGARDLESS OF THE FORM OF ACTION.

7. GOVERNING LAW.
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles. Any disputes shall be resolved in the federal courts located in Wilmington, Delaware.
`;
