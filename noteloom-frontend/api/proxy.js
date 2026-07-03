export default async function handler(req, res) {
  const hfToken = process.env.HF_TOKEN;
  const hfSpaceUrl = process.env.HF_SPACE_URL || 'https://noteloom-devops-noteloom-backend.hf.space';

  if (!hfToken) {
    return res.status(500).json({ error: "HF_TOKEN environment variable is missing on Vercel." });
  }

  // Parse the query parameters from the request URL
  const parsedUrl = new URL(req.url, 'http://localhost');
  const originalPath = parsedUrl.searchParams.get('path');

  if (!originalPath) {
    return res.status(400).json({ error: "Missing 'path' parameter in proxy request." });
  }

  // Remove the 'path' parameter so it isn't forwarded to the backend
  parsedUrl.searchParams.delete('path');

  // Construct the target URL pointing to your private Hugging Face Space
  const targetUrl = `${hfSpaceUrl}${originalPath}${parsedUrl.search}`;

  // Copy incoming headers and clean up host-specific headers
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];
  delete headers['transfer-encoding'];
  
  // Preserve the client's original authorization token in a custom header
  if (req.headers.authorization) {
    headers['x-user-token'] = req.headers.authorization;
  }
  
  // Inject the Hugging Face Authorization token securely on the server
  headers['authorization'] = `Bearer ${hfToken}`;

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Vercel auto-parses req.body for JSON. We stringify it back to send it.
    body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    if (body && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    const data = await response.text();
    
    // Forward the response status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Avoid content-encoding, content-length, and transfer-encoding mismatches
      if (
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length' &&
        lowerKey !== 'transfer-encoding'
      ) {
        res.setHeader(key, value);
      }
    });

    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy failed to reach backend" });
  }
}
