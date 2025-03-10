import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../lib/prisma';
import { fetchEventbriteAPI, standardizeEventbriteEvent } from '../../../lib/eventbrite';

const prismaClient = new PrismaClient();

export default async function handler(req, res) {
  // Get the user's session token
  const token = await getToken({ req });
  
  // Handle GET request (list events)
  if (req.method === 'GET') {
    try {
      // Fetch local events from your database
      console.log("Fetching local events...");
      const localEvents = await prisma.event.findMany();
      console.log(`Found ${localEvents.length} local events`);

      try {
        // Try to fetch EventBrite events, but don't fail if this part errors
        console.log("Fetching EventBrite events...");
        const queryParams = new URLSearchParams({
          'q': 'business',
          'location.address': 'United States',
          'expand': 'venue,ticket_availability'
        }).toString();

        const eventbriteResponse = await fetchEventbriteAPI(`/events/search?${queryParams}`);
        const eventbriteEvents = eventbriteResponse.events.map(standardizeEventbriteEvent);
        console.log(`Found ${eventbriteEvents.length} EventBrite events`);

        // Combine both sources
        const allEvents = [
          ...localEvents.map(event => ({ ...event, source: 'local' })),
          ...eventbriteEvents
        ];

        // Sort by date
        allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        return res.json(allEvents);
      } catch (eventbriteError) {
        // If EventBrite fails, just return local events
        console.error('EventBrite API error:', eventbriteError);
        return res.json(localEvents.map(event => ({ ...event, source: 'local' })));
      }
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch events from database' });
    }
  }
  
  // Check if user is authenticated for other methods
  if (!token) {
    return res.status(401).json({ error: 'You must be signed in to perform this action' });
  }
  
  // Handle POST request (create event)
  if (req.method === 'POST') {
    const { 
      title, 
      description, 
      eventType,
      industry,
      startDate, 
      endDate, 
      location, 
      address,
      isVirtual,
      meetingLink,
      price,
      imageUrl
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !eventType || !industry || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate location data based on event type
    if (!isVirtual && (!location || !address)) {
      return res.status(400).json({ error: 'Location and address are required for in-person events' });
    }
    
    if (isVirtual && !meetingLink) {
      return res.status(400).json({ error: 'Meeting link is required for virtual events' });
    }
    
    try {
      // Create the event
      const event = await prismaClient.event.create({
        data: {
          title,
          description,
          eventType,
          industry,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          location: isVirtual ? 'Virtual' : location,
          address: isVirtual ? 'N/A' : address,
          isVirtual,
          meetingLink: isVirtual ? meetingLink : null,
          price: price ? parseFloat(price) : null,
          imageUrl: imageUrl || null
        }
      });
      
      return res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}