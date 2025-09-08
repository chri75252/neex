import * as pdfjsLib from 'pdfjs-dist';

// Since the mammoth.js library loaded from the CDN is a UMD module,
// it attaches itself to the window object. We declare it here to
// inform TypeScript about the global 'mammoth' variable.
declare global {
    interface Window {
        mammoth: {
            extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
        };
    }
}

// Set worker source for pdf.js, pointing to the CDN-hosted worker file.
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

async function parseTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function parseDocx(file: File): Promise<string> {
    if (!window.mammoth) {
        throw new Error('Document processing library not loaded. Please refresh the page and try again.');
    }
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Access mammoth from the global window object.
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        
        if (!result || !result.value) {
            throw new Error('Failed to extract text from DOCX file. The file may be corrupted or empty.');
        }
        
        return result.value;
    } catch (error) {
        if (error instanceof Error && error.message.includes('not loaded')) {
            throw error;
        }
        throw new Error(`Failed to parse DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function parsePdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // The type for `textContent.items` is complex, so we use `any` for simplicity here.
        // `item.str` is the property containing the text of a segment.
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
}

export async function parseFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch(extension) {
        case 'txt':
            return parseTxt(file);
        case 'docx':
            return parseDocx(file);
        case 'pdf':
            return parsePdf(file);
        default:
            throw new Error('Unsupported file type. Please upload a .txt, .docx, or .pdf file.');
    }
}
