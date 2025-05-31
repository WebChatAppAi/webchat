import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, fileContent } = await request.json(); // Added fileContent

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // In a real application, you would call an AI service here
    // For now, we'll just echo back a simple response

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let responseText = `This is a simulated AI response to: "${message}".`;
    if (fileContent && typeof fileContent === 'string' && fileContent.trim() !== '') {
      // If fileContent is provided, prepend it to the responseText.
      // In a real scenario, this fileContent would be part of the prompt/context sent to the AI.
      responseText = `Processed File Content:\n---\n${fileContent.trim()}\n---\n\n${responseText}`;
    }
    responseText += "\n\nIn a real application, this would be the response from an AI model like GPT-4 or another language model.";

    const response = {
      id: Date.now().toString(),
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chat API is working. Use POST to send messages.' }
  );
}
