import { NextRequest, NextResponse } from 'next/server';
// pdf-parse is a CommonJS module, so we need to import it like this
const pdf = require('pdf-parse');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = await pdf(arrayBuffer);
    
    return NextResponse.json({ text: data.text }, { status: 200 });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    let errorMessage = 'Error parsing PDF.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}