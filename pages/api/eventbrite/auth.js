import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Construct the authorization URL
  const authUrl = `https://www.eventbrite.com/oauth/authorize?` + 
    `response_type=code&` +
    `client_id=${process.env.EVENTBRITE_API_KEY}&` +
    `redirect_uri=${encodeURIComponent(process.env.EVENTBRITE_REDIRECT_URI)}`;

  // Redirect the user to Eventbrite's authorization page
  res.redirect(authUrl);
} 