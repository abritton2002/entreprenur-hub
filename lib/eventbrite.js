export async function fetchEventbriteAPI(endpoint, options = {}) {
  const baseURL = 'https://www.eventbriteapi.com/v3';
  const apiKey = process.env.EVENTBRITE_API_KEY;
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const url = `${baseURL}${endpoint}`;
  console.log('Fetching URL:', url); // Add this for debugging

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('EventBrite API Error:', data); // Add this for debugging
    throw new Error(data.error_description || data.error || 'EventBrite API request failed');
  }

  return data;
}

// Helper function to standardize event format
export function standardizeEventbriteEvent(eventbriteEvent) {
  return {
    id: `eventbrite_${eventbriteEvent.id}`,
    title: eventbriteEvent.name.text,
    description: eventbriteEvent.description.text,
    startDate: new Date(eventbriteEvent.start.utc),
    endDate: new Date(eventbriteEvent.end.utc),
    location: eventbriteEvent.venue?.name || 'Online Event',
    address: eventbriteEvent.venue?.address?.localized_address_display || '',
    isVirtual: eventbriteEvent.online_event,
    eventType: mapEventbriteCategory(eventbriteEvent.category_id),
    industry: mapEventbriteSubCategory(eventbriteEvent.subcategory_id),
    price: eventbriteEvent.is_free ? 0 : parseFloat(eventbriteEvent.ticket_availability?.minimum_ticket_price?.major_value || 0),
    imageUrl: eventbriteEvent.logo?.url,
    source: 'eventbrite',
    externalUrl: eventbriteEvent.url
  };
}

// You'll need to map EventBrite categories to your categories
function mapEventbriteCategory(categoryId) {
  const categoryMap = {
    '101': 'Conference',
    '102': 'Workshop',
    // Add more mappings as needed
  };
  return categoryMap[categoryId] || 'Other';
}

function mapEventbriteSubCategory(subcategoryId) {
  // Implement the logic to map subcategoryId to your industry format
  return 'Other'; // Placeholder return, actual implementation needed
} 