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
  FaSearch
} from 'react-icons/fa';
import Layout from '../../components/Layout';

// Event types with icons
const EVENT_TYPES = {
  'Networking': { icon: '🤝', description: 'Connect with fellow entrepreneurs' },
  'Workshop': { icon: '🛠️', description: 'Hands-on learning experiences' },
  'Conference': { icon: '🎤', description: 'Industry insights and speakers' },
  'Pitch Competition': { icon: '🏆', description: 'Present your ideas and win prizes' },
  'Hackathon': { icon: '💻', description: 'Collaborative coding events' },
  'Panel Discussion': { icon: '👥', description: 'Expert discussions on key topics' },
  'Fireside Chat': { icon: '🔥', description: 'Intimate conversations with leaders' },
  'Demo Day': { icon: '🚀', description: 'Showcase your product or service' },
  'Meetup': { icon: '👋', description: 'Casual gatherings for entrepreneurs' },
  'Other': { icon: '📌', description: 'Other entrepreneurial events' }
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
        setEvents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
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
    { key: 'ALL', label: 'All Events', icon: '🌐' },
    ...Object.entries(EVENT_TYPES).map(([key, type]) => ({
      key,
      label: key,
      icon: type.icon
    }))
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Entrepreneurial Events</h1>
            <p className="text-gray-600 mt-1">Connect, learn, and grow with other entrepreneurs</p>
          </div>
          
          {/* New Event Button */}
          {session && (
            <Link href="/events/new">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center"
                title="Create a New Event"
              >
                <FaPlus className="mr-2" /> New Event
              </button>
            </Link>
          )}
        </div>

        {/* Event Type Tabs */}
        <div className="mb-6 flex overflow-x-auto space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition
                ${activeTab === tab.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters Section */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="flex items-center mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border p-2 pl-10 rounded-md"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
            >
              <FaFilter className="mr-2" /> 
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Industry Filter */}
              <select
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
                className="border p-2 rounded-md"
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>

              {/* Virtual/In-Person Filter */}
              <select
                value={filters.isVirtual === null ? '' : filters.isVirtual}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters, 
                    isVirtual: value === '' ? null : value === 'true'
                  });
                }}
                className="border p-2 rounded-md"
              >
                <option value="">All Locations</option>
                <option value="true">Virtual Only</option>
                <option value="false">In-Person Only</option>
              </select>
            </div>
          )}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-blue-600">Loading events...</div>
          </div>
        ) : (
          <>
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-gray-600 mb-4">No events match your filters.</p>
                {session ? (
                  <Link href="/events/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                      Create a new event
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => signIn("google")} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Sign in to create an event
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 border-blue-500">
                      {/* Event Type Badge */}
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {EVENT_TYPES[event.eventType]?.icon || '📌'}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {event.eventType || 'Other Event'}
                        </span>
                      </div>

                      <h2 className="font-bold text-xl text-gray-800 hover:text-blue-600 transition">
                        {event.title}
                      </h2>
                      <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center mt-4 text-sm text-gray-500 space-x-4 flex-wrap">
                        {/* Date */}
                        <div className="flex items-center mr-4">
                          <FaCalendarAlt className="mr-1 text-blue-500" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center mr-4">
                          {event.isVirtual ? (
                            <>
                              <FaVideo className="mr-1 text-green-500" />
                              <span>Virtual Event</span>
                            </>
                          ) : (
                            <>
                              <FaMapMarkerAlt className="mr-1 text-red-500" />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>

                        {/* Industry */}
                        {event.industry && (
                          <div className="flex items-center mr-4">
                            <FaIndustry className="mr-1 text-purple-500" />
                            <span>{event.industry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Floating Add Button (for mobile) */}
        {session && (
          <Link href="/events/new">
            <button
              className="fixed md:hidden bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition z-10"
              title="Create a New Event"
            >
              <FaPlus />
            </button>
          </Link>
        )}
      </div>
    </Layout>
  );
}