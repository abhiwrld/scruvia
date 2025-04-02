// File parsing utilities - we'll load everything dynamically to avoid server-side issues
let mammoth: any = null;
let pdfjs: any = null;

// Initialize mammoth for DOCX parsing
async function initMammoth() {
  if (typeof window !== 'undefined' && !mammoth) {
    try {
      mammoth = await import('mammoth');
    } catch (error) {
      console.error('Failed to load mammoth:', error);
    }
  }
  return mammoth;
}

// Initialize PDF.js only on the client side
async function initPdfJs() {
  if (typeof window !== 'undefined' && !pdfjs) {
    // Dynamic import to prevent server-side issues
    pdfjs = await import('pdfjs-dist');
    
    // Set worker path
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }
  
  return pdfjs;
}

/**
 * Extracts text content from various file types
 */
export async function extractTextFromFile(file: File, fileUrl: string): Promise<string> {
  try {
    // Verify we're running in the browser
    if (typeof window === 'undefined') {
      return "File extraction is only available in browser environments.";
    }
    
    // Get file extension from name
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    console.log(`Extracting content from ${fileExtension} file: ${file.name}`);
    
    // Use our browser-safe API approach
    return await extractContentWithApi(fileUrl, file.type);
  } catch (error: any) {
    console.error('Error extracting text from file:', error);
    return `Error extracting text from file: ${error.message}`;
  }
}

/**
 * Extracts text from PDF files
 */
async function extractPdfText(fileUrl: string): Promise<string> {
  try {
    // Initialize PDF.js
    const pdf = await initPdfJs();
    if (!pdf) {
      return "PDF extraction is only available in browser environments.";
    }
    
    // Fetch the PDF file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    // Get the file buffer
    const buffer = await response.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await pdf.getDocument({ data: buffer }).promise;
    
    // Initialize text content
    let textContent = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      
      // Concatenate text items
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
        
      textContent += pageText + '\n\n';
    }
    
    return textContent || 'No text content found in the PDF.';
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return `Error parsing PDF: ${error.message}`;
  }
}

/**
 * Extracts text from DOCX files
 */
async function extractDocxText(fileUrl: string): Promise<string> {
  try {
    // Initialize mammoth
    const mammothLib = await initMammoth();
    if (!mammothLib) {
      return "DOCX extraction is only available in browser environments.";
    }
    
    // Fetch the DOCX file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
    }
    
    // Get the file buffer
    const buffer = await response.arrayBuffer();
    
    try {
      // Convert the DOCX to text
      const result = await mammothLib.extractRawText({
        arrayBuffer: buffer
      });
      
      // Return the extracted text
      return result.value || 'No text content found in the DOCX.';
    } catch (mammothError) {
      console.error('Mammoth error:', mammothError);
      
      // Fallback to a simpler extraction method
      return "DOCX content extraction failed. Please try another file format.";
    }
  } catch (error: any) {
    console.error('Error parsing DOCX:', error);
    return `Error parsing DOCX: ${error.message}`;
  }
}

/**
 * Extracts text from TXT files
 */
async function extractTxtText(fileUrl: string): Promise<string> {
  try {
    // Fetch the TXT file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch TXT: ${response.statusText}`);
    }
    
    // Get the text content
    const text = await response.text();
    
    // Return the text
    return text || 'No content found in the TXT file.';
  } catch (error: any) {
    console.error('Error reading TXT file:', error);
    return `Error reading TXT file: ${error.message}`;
  }
}

/**
 * Extracts text from CSV files
 */
async function extractCsvText(fileUrl: string): Promise<string> {
  try {
    // Fetch the CSV file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    // Get the text content
    const text = await response.text();
    
    // Return the text
    return text || 'No content found in the CSV file.';
  } catch (error: any) {
    console.error('Error reading CSV file:', error);
    return `Error reading CSV file: ${error.message}`;
  }
}

/**
 * Summarizes file content for display
 */
export function getFileContentSummary(content: string, maxLength: number = 200): string {
  if (!content) return 'No content found';
  
  // Trim the content if it's too long
  if (content.length > maxLength) {
    return `${content.substring(0, maxLength)}...`;
  }
  
  return content;
}

// Add this implementation to ensure browser compatibility
/**
 * Extracts content from a file URL by requesting an external service
 * This is a fallback approach for browsers that can't use pdf-parse or other server libraries
 */
async function extractContentWithApi(fileUrl: string, fileType: string): Promise<string> {
  try {
    // For text-based files we can use fetch
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      const response = await fetch(fileUrl);
      const text = await response.text();
      return text;
    }
    
    // For PDF files, we'll use PDF.js
    if (fileType.includes('pdf')) {
      return extractPdfText(fileUrl);
    }
    
    // For DOCX files, we'll use mammoth
    if (fileType.includes('docx') || fileType.includes('word')) {
      return extractDocxText(fileUrl);
    }
    
    return `File type ${fileType} extraction is not supported on this browser.`;
  } catch (error: any) {
    console.error('Error extracting content with API:', error);
    return `Error extracting content: ${error.message}`;
  }
} 