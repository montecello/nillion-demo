import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for better compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid Edge runtime issues
    const { createWorker } = await import('tesseract.js');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type === 'image/webp' || file.type === 'image/jpeg' || file.type === 'image/png';

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: 'File must be a PDF or image (WEBP, JPEG, PNG)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    console.log(`📄 [EXTRACT] Processing ${isPdf ? 'PDF' : 'image'}:`, file.name, `(${Math.round(file.size / 1024)}KB)`);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    let pages = 1;

    if (isPdf) {
      // Extract text from PDF using pdf2json (pure Node.js, no DOM dependencies)
      const PDFParser = (await import('pdf2json')).default;
      const pdfParser = new PDFParser();
      
      const pdfData = await new Promise<any>((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', (data: any) => resolve(data));
        pdfParser.parseBuffer(buffer);
      });
      
      // Extract text from all pages with safe URI decoding
      extractedText = pdfData.Pages.map((page: any) => 
        page.Texts.map((text: any) => 
          text.R.map((r: any) => {
            try {
              return decodeURIComponent(r.T);
            } catch (e) {
              // If decoding fails, return the raw text
              return r.T;
            }
          }).join(' ')
        ).join(' ')
      ).join('\n\n');
      
      pages = pdfData.Pages.length;
      console.log('✅ [PDF] Extracted', pages, 'pages,', extractedText.length, 'characters');
    } else {
      // Extract text from image using OCR
      console.log('🔍 [OCR] Starting text recognition...');
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      extractedText = text;
      console.log('✅ [OCR] Extracted', extractedText.length, 'characters');
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: isPdf ? 'PDF appears to be empty' : 'No text found in image' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      metadata: {
        pages,
        characters: extractedText.length,
        filename: file.name,
        size_bytes: file.size,
        type: isPdf ? 'pdf' : 'image',
      },
    });
  } catch (error: any) {
    console.error('❌ [EXTRACT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text', details: error.message },
      { status: 500 }
    );
  }
}
