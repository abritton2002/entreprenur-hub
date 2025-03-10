import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import { fetchEventbriteAPI } from '../../../lib/eventbrite';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { eventbriteToken: true }
    });

    if (!user?.eventbriteToken) {
      return res.status(401).json({ error: 'EventBrite not connected' });
    }

    const events = await fetchEventbriteAPI('/users/me/events/', {
      token: user.eventbriteToken
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching EventBrite events:', error);
    res.status(500).json({ error: 'Failed to fetch EventBrite events' });
  }
} 