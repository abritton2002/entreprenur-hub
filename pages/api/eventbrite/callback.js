import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://www.eventbrite.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.EVENTBRITE_API_KEY,
        client_secret: process.env.EVENTBRITE_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.EVENTBRITE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Store the access token in your database
    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        eventbriteToken: tokenData.access_token,
      },
    });

    // Redirect back to the events page
    res.redirect('/events');
  } catch (error) {
    console.error('EventBrite OAuth Error:', error);
    res.redirect('/events?error=eventbrite_auth_failed');
  }
} 