export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In a real application, you would send the notification to the subscribed users
    // This is just a simulation for testing purposes
    
    console.log('Notification request received:', body);
    
    // Simulate sending notification
    return new Response(JSON.stringify({
      success: true,
      message: 'Notification sent successfully',
      data: {
        title: body.title,
        body: body.body,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Type guard to ensure error is an Error instance
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}