export default async function handler(req, res) {
    const { url, token } = req.query;

    if (!url || !token) {
        return res.status(400).json({ error: 'Missing url or token parameters' });
    }

    // Security check: Only allow Mercado Pago API URLs
    if (!url.startsWith('https://api.mercadopago.com/')) {
        return res.status(403).json({ error: 'Only Mercado Pago API URLs are allowed' });
    }

    try {
        console.log(`[Proxy] Fetching: ${url}`);
        const mpResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await mpResponse.json();
        return res.status(mpResponse.status).json(data);
    } catch (error) {
        console.error('[Proxy] Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
