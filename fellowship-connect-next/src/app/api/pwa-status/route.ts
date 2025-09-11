export async function GET() {
  return new Response(JSON.stringify({
    message: 'PWA Status API',
    timestamp: new Date().toISOString(),
    status: 'ok',
    features: {
      serviceWorker: 'enabled',
      manifest: 'available',
      offlineSupport: 'enabled',
      pushNotifications: 'configured',
      installable: 'ready'
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}