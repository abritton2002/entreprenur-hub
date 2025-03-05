import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Layout from '../../components/Layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Event types and industries for dropdown selection
const EVENT_TYPES = [
  'Networking', 
  'Workshop', 
  'Conference', 
  'Pitch Competition',
  'Hackathon',
  'Panel Discussion',
  'Fireside Chat',
  'Demo Day',
  'Meetup',
  'Other'
];

const INDUSTRIES = [
  'Technology', 
  'SaaS', 
  'E-commerce', 
  'FinTech', 
  'Healthcare', 
  'EdTech', 
  'AI/ML', 
  'Blockchain', 
  'Sustainability', 
  'Other'
];

export default function CreateEvent() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    industry: '',
    startDate: new Date(),
    endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
    location: '',
    address: '',
    isVirtual: false,
    meetingLink: '',
    price: '',
    imageUrl: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.eventType || !formData.industry) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!formData.isVirtual && (!formData.location || !formData.address)) {
      setError('Please provide a location and address for in-person events');
      return;
    }
    
    if (formData.isVirtual && !formData.meetingLink) {
      setError('Please provide a meeting link for virtual events');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const event = await response.json();
      router.push('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect if not logged in
  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
            <p className="text-gray-600 mb-4">You need to be signed in to create an event.</p>
            <button 
              onClick={() => signIn("google")} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Sign in to create an event
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create New Event</h1>
            <p className="text-gray-600 mt-1">Share your entrepreneurial events with the community</p>
          </div>
          
          <Link href="/events">
            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Events
            </button>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          {/* Event Title */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Enter a descriptive title for your event"
              required
            />
          </div>
          
          {/* Event Description */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              rows="4"
              placeholder="Describe your event, its purpose, and what attendees can expect"
              required
            />
          </div>
          
          {/* Event Type and Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="eventType">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="industry">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Start Date and Time *
              </label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                End Date and Time *
              </label>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                minDate={formData.startDate}
                required
              />
            </div>
          </div>
          
          {/* Virtual Event Toggle */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isVirtual"
                checked={formData.isVirtual}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700 font-semibold">This is a virtual event</span>
            </label>
          </div>
          
          {/* Conditional Fields Based on Event Type */}
          {formData.isVirtual ? (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="meetingLink">
                Meeting Link *
              </label>
              <input
                type="url"
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="https://zoom.us/j/example"
                required={formData.isVirtual}
              />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="location">
                  Venue Name *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="e.g., Tech Hub Conference Center"
                  required={!formData.isVirtual}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="address">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Full address including city and zip code"
                  required={!formData.isVirtual}
                />
              </div>
            </>
          )}
          
          {/* Price */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="price">
              Price (leave empty for free events)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full pl-7 border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          {/* Image URL */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="imageUrl">
              Event Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex items-center px-4 py-2 rounded-lg shadow transition
                ${isSubmitting 
                  ? 'bg-blue-400 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}
              `}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}