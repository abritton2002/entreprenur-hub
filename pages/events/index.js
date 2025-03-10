import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaVideo,
  FaFilter,
  FaIndustry,
  FaTags,
  FaSearch,
  FaNetworkWired,
  FaTools,
  FaMicrophone,
  FaTrophy,
  FaLaptopCode,
  FaUsers,
  FaFire,
  FaRocket,
  FaHandshake,
  FaThumbtack,
  FaGlobe,
  FaQuestionCircle
} from 'react-icons/fa';
import Layout from '../../components/Layout';

// Event types with icons
const EVENT_TYPES = {
  'Networking': { 
    label: 'Networking', 
    description: 'Connect with fellow entrepreneurs',
    icon: <FaHandshake className="text-[#0EA5E9]" />,
    color: "#0EA5E9" // Blue
  },
  'Workshop': { 
    label: 'Workshop', 
    description: 'Hands-on learning experiences',
    icon: <FaTools className="text-[#F59E0B]" />, 
    color: "#F59E0B" // Amber
  },
  'Conference': { 
    label: 'Conference', 
    description: 'Industry insights and speakers',
    icon: <FaMicrophone className="text-[#7C3AED]" />, 
    color: "#7C3AED" // Purple
  },
  'Pitch Competition': { 
    label: 'Pitch Competition', 
    description: 'Present your ideas and win prizes',
    icon: <FaTrophy className="text-[#F43F5E]" />, 
    color: "#F43F5E" // Rose
  },
  'Hackathon': { 
    label: 'Hackathon', 
    description: 'Collaborative coding events',
    icon: <FaLaptopCode className="text-[#10B981]" />, 
    color: "#10B981" // Green
  },
  'Panel Discussion': { 
    label: 'Panel Discussion', 
    description: 'Expert discussions on key topics',
    icon: <FaUsers className="text-[#6366F1]" />, 
    color: "#6366F1" // Indigo
  },
  'Fireside Chat': { 
    label: 'Fireside Chat', 
    description: 'Intimate conversations with leaders',
    icon: <FaFire className="text-[#EF4444]" />, 
    color: "#EF4444" // Red
  },
  'Demo Day': { 
    label: 'Demo Day', 
    description: 'Showcase your product or service',
    icon: <FaRocket className="text-[#8B5CF6]" />, 
    color: "#8B5CF6" // Violet
  },
  'Meetup': { 
    label: 'Meetup', 
    description: 'Casual gatherings for entrepreneurs',
    icon: <FaNetworkWired className="text-[#14B8A6]" />, 
    color: "#14B8A6" // Teal
  },
  'Other': { 
    label: 'Other', 
    description: 'Other entrepreneurial events',
    icon: <FaThumbtack className="text-[#64748B]" />, 
    color: "#64748B" // Slate
  }
};

// Industries list
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

export default function Events() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [filters, setFilters] = useState({
    type: null,
    industry: '',
    isVirtual: null,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch events from the API
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setEvents([]);
        setLoading(false);
      });
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter events based on selected criteria and active tab
  const filteredEvents = events.filter(event => {
    const typeMatch = 
      activeTab === 'ALL' || 
      activeTab === event.eventType ||
      (activeTab === 'OTHER' && !Object.keys(EVENT_TYPES).includes(event.eventType));
    
    const industryMatch = !filters.industry || 
      event.industry?.toLowerCase() === filters.industry.toLowerCase();
    
    const virtualMatch = filters.isVirtual === null || 
      event.isVirtual === filters.isVirtual;
    
    const searchMatch = !filters.search || 
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return typeMatch && industryMatch && virtualMatch && searchMatch;
  });

  // Prepare tabs
  const tabs = [
    { key: 'ALL', label: 'All Events', icon: <FaGlobe className="text-[#1E40AF]" /> },
    ...Object.entries(EVENT_TYPES).map(([key, type]) => ({
      key,
      label: type.label,
      icon: type.icon
    }))
  ];

  const connectEventbrite = async () => {
    window.location.href = '/api/eventbrite/auth';
  };

  return (
    <Layout>
      {/* Page Hero Section */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#6366F1] py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white">Entrepreneurial Events</h1>
            <p className="text-xl text-blue-100">Connect, learn, and grow with other entrepreneurs</p>
            
            {session && (
              <Link href="/events/new">
                <button className="mt-6 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow-lg transition flex items-center">
                  <FaPlus className="mr-2" /> Create New Event
                </button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Wave separator */}
        <svg className="fill-white w-full h-16 -mb-1 mt-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path d="M0,96L48,117.3C96,139,192,181,288,186.7C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-6 py-8 -mt-4">
        {/* Event Type Tabs - improved accessibility and visual distinction */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <h2 className="sr-only">Filter by Event Type</h2>
          <div className="flex overflow-x-auto pb-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${activeTab === tab.key 
                    ? 'bg-[#1E40AF] text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                `}
                aria-pressed={activeTab === tab.key}
                aria-label={`Filter by ${tab.label}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Section - improved organization */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Search Bar */}
            <div className="relative flex-grow w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search events"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center"
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
            >
              <FaFilter className="mr-2" /> 
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
            
            {session && (
              <Link href="/events/new" className="ml-auto hidden lg:block">
                <button className="px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow transition flex items-center">
                  <FaPlus className="mr-2" /> New Event
                </button>
              </Link>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div id="advanced-filters" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {/* Event Type Filter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  id="industry-filter"
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Virtual/In-Person Filter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label htmlFor="virtual-filter" className="block text-sm font-medium text-gray-700 mb-2">Event Format</label>
                <select
                  id="virtual-filter"
                  value={filters.isVirtual === null ? '' : filters.isVirtual.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      ...filters, 
                      isVirtual: value === '' ? null : value === 'true'
                    });
                  }}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Formats</option>
                  <option value="true">Virtual Only</option>
                  <option value="false">In-Person Only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results summary */}
        {!loading && (
          <div className="mb-4 text-gray-600">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            {activeTab !== 'ALL' && ` of type ${activeTab}`}
            {filters.industry && ` in the ${filters.industry} industry`}
            {filters.isVirtual !== null && ` that are ${filters.isVirtual ? 'virtual' : 'in-person'}`}
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm p-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-[#1E40AF] border-blue-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCalendarAlt className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">No events found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or create a new event</p>
                {session ? (
                  <Link href="/events/new">
                    <button className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow transition">
                      Create a new event
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => signIn("google")} 
                    className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow transition"
                  >
                    Sign in to create an event
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEvents.map((event) => {
                  const eventType = EVENT_TYPES[event.eventType] || {
                    icon: <FaQuestionCircle className="text-gray-500" />,
                    label: 'Other Event',
                    color: "#64748B" // Slate
                  };
                  
                  return (
                    <Link 
                      key={event.id}
                      href={event.source === 'eventbrite' ? event.externalUrl : `/events/${event.id}`}
                      target={event.source === 'eventbrite' ? '_blank' : '_self'}
                    >
                      <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 cursor-pointer" 
                        style={{ borderLeftColor: eventType.color }}
                      >
                        <div className="flex items-start">
                          {/* Left column - Type icon */}
                          <div className="hidden sm:block mr-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                              style={{ backgroundColor: `${eventType.color}15` }}
                            >
                              {eventType.icon}
                            </div>
                          </div>
                          
                          {/* Right column - Content */}
                          <div className="flex-1">
                            {/* Event Type Badge */}
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <div className="flex items-center">
                                <span className="sm:hidden mr-2">
                                  {eventType.icon}
                                </span>
                                <span className="text-sm font-semibold px-3 py-1 rounded-full" 
                                  style={{ 
                                    backgroundColor: `${eventType.color}15`,
                                    color: eventType.color 
                                  }}
                                >
                                  {eventType.label}
                                </span>
                              </div>
                            </div>

                            {/* Title and Content */}
                            <h2 className="font-bold text-xl text-gray-800 group-hover:text-[#1E40AF] transition mb-2">
                              {event.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              {/* Date */}
                              <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                <FaCalendarAlt className="mr-1" />
                                <span>{formatDate(event.startDate)}</span>
                              </div>

                              {/* Location */}
                              <div className="flex items-center px-3 py-1 rounded-full">
                                {event.isVirtual ? (
                                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                    <FaVideo className="mr-1" />
                                    <span>Virtual Event</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full">
                                    <FaMapMarkerAlt className="mr-1" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>

                              {/* Industry */}
                              {event.industry && (
                                <div className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                                  <FaIndustry className="mr-1" />
                                  <span>{event.industry}</span>
                                </div>
                              )}
                              
                              {/* Price Badge */}
                              {event.price ? (
                                <div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full ml-auto">
                                  <span>${event.price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full ml-auto">
                                  <span>Free</span>
                                </div>
                              )}
                            </div>

                            {/* Add source badge */}
                            <div className="mt-2">
                              {event.source === 'eventbrite' && (
                                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                  Via EventBrite
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Floating Add Button (for mobile) */}
        {session && (
          <Link href="/events/new">
            <button
              className="fixed md:hidden bottom-6 right-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-4 rounded-full shadow-lg transition z-10"
              title="Create a New Event"
              aria-label="Create a New Event"
            >
              <FaPlus size={20} />
            </button>
          </Link>
        )}

        <button
          onClick={connectEventbrite}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Connect with EventBrite
        </button>
      </div>
    </Layout>
  );
}