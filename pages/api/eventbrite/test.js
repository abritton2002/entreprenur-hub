import { fetchEventbriteAPI, standardizeEventbriteEvent } from '../../../lib/eventbrite';

export default async function handler(req, res) {
  try {
    // Log the first few characters of the API key for debugging
    console.log('API Key prefix:', process.env.EVENTBRITE_API_KEY.substring(0, 10) + '...');
    
    // Search for public events
    const queryParams = new URLSearchParams({
      'q': 'business',  // search term
      'location.address': 'United States',
      'expand': 'venue,ticket_availability'
    }).toString();

    const response = await fetchEventbriteAPI(`/events/search?${queryParams}`);

    res.json({
      success: true,
      total: response.events?.length || 0,
      events: response.events?.slice(0, 5) || [],
      pagination: response.pagination
    });

  } catch (error) {
    console.error('EventBrite API Test Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch EventBrite events',
      details: error.message,
      hint: "Make sure you're using the Private Token that starts with 'PERSONAL_TOKEN_'"
    });
  }
} 