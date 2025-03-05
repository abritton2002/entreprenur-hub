import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get the user's session token
  const token = await getToken({ req });
  
  // Handle GET request (list events)
  if (req.method === 'GET') {
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          startDate: 'asc'
        }
      });
      
      // Always return an array, even if it's empty
      return res.status(200).json(events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Return an empty array instead of an error object
      return res.status(200).json([]);
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
      const event = await prisma.event.create({
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