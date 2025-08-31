import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {prompt} = body;

    if (!prompt) {
      return NextResponse.json({error: 'Prompt is required'}, {status: 400});
    }

    // This is a endpoint. In a real scenario, you would make a call
    // to your Vertex AI fine-tuned model endpoint here.
    console.log(`Received prompt for fine-tuned model: ${prompt}`);

    // Simulate a response from a fine-tuned model
    const response = {
      prediction: `This is a fine-tuned response for the prompt: "${prompt}". The model has successfully processed your request.`,
      confidence: Math.random() * (0.99 - 0.85) + 0.85, // Random confidence between 85% and 99%
      model: 'recipes_v6',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in finetune endpoint:', error);
    return NextResponse.json(
      {error: 'An internal server error occurred.'},
      {status: 500}
    );
  }
}
