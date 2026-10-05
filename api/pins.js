// Vercel serverless function: returns image URLs from a Pinterest board.
// The access token stays server-side; the browser only sees the JSON below.
//
// Env vars (Vercel -> Project Settings -> Environment Variables):
//   PINTEREST_BOARD_ID       numeric board id (see README for how to find it)
//   PINTEREST_ACCESS_TOKEN   access token from the Pinterest developer portal
// Optional, to auto-renew the token when it expires:
//   PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REFRESH_TOKEN

const API = 'https://api.pinterest.com/v5';

async function refreshAccessToken() {
  const { PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REFRESH_TOKEN } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET || !PINTEREST_REFRESH_TOKEN) return null;

  const basic = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64');
  const res = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: PINTEREST_REFRESH_TOKEN
    })
  });
  if (!res.ok) return null;
  return (await res.json()).access_token || null;
}

async function fetchPins(token, boardId) {
  return fetch(`${API}/boards/${boardId}/pins?page_size=50`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

module.exports = async (req, res) => {
  const boardId = process.env.PINTEREST_BOARD_ID;
  let token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!boardId || !token) {
    return res.status(500).json({ error: 'Pinterest env vars are not configured' });
  }

  try {
    let upstream = await fetchPins(token, boardId);
    if (upstream.status === 401) {
      token = await refreshAccessToken();
      if (token) upstream = await fetchPins(token, boardId);
    }
    if (!upstream.ok) {
      return res.status(502).json({ error: `Pinterest responded ${upstream.status}` });
    }

    const data = await upstream.json();
    const images = (data.items || [])
      .map(pin => pin.media && pin.media.images && (pin.media.images['600x'] || pin.media.images['400x300']))
      .filter(Boolean)
      .map(img => img.url);

    // Cache at Vercel's edge for an hour so we stay well under Pinterest's rate limits.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Pinterest' });
  }
};
