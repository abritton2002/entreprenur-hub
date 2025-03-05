import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { 
  FaPlus, 
  FaComment, 
  FaThumbsUp, 
  FaCalendarAlt, 
  FaBolt,
  FaFilter,
  FaIndustry,
  FaTags,
  FaSearch
} from "react-icons/fa";
import Layout from "../components/Layout";

// Discussion type mapping with more details
const DISCUSSION_TYPES = {
  GENERAL: { 
    label: 'General Discussion', 
    description: 'Open conversations for entrepreneurs',
    icon: '💬'
  },
  PIVOT_STRATEGY: { 
    label: 'Pivot Strategy', 
    description: 'Explore business model transformations',
    icon: '🔄'
  },
  MVP_FEEDBACK: { 
    label: 'MVP Feedback', 
    description: 'Validate and refine product concepts',
    icon: '🚀'
  },
  RESOURCE_SHARING: { 
    label: 'Resource Sharing', 
    description: 'Tools, guides, and entrepreneurial resources',
    icon: '💡'
  },
  FUNDING_INSIGHTS: { 
    label: 'Funding Insights', 
    description: 'Fundraising strategies and investment opportunities',
    icon: '💰'
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

export default function Discussions() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [filters, setFilters] = useState({
    type: null,
    minImpact: 0,
    industry: '',
    tags: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch discussions from the API
    setLoading(true);
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching discussions:", error);
        setLoading(false);
      });
  }, []);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter posts based on selected criteria and active tab
  const filteredPosts = posts.filter(post => {
    const typeMatch = 
      activeTab === 'ALL' || 
      activeTab === post.discussionType ||
      (activeTab === 'OTHER' && !Object.keys(DISCUSSION_TYPES).includes(post.discussionType));
    const impactMatch = post.potentialImpact >= filters.minImpact;
    const industryMatch = !filters.industry || 
      post.industry?.toLowerCase() === filters.industry.toLowerCase();
    const tagsMatch = !filters.tags || 
      post.tags?.toLowerCase().includes(filters.tags.toLowerCase());
    const searchMatch = !filters.search || 
      post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.search.toLowerCase());
    
    return typeMatch && impactMatch && industryMatch && tagsMatch && searchMatch;
  });

  // Prepare tabs
  const tabs = [
    { key: 'ALL', label: 'All Discussions', icon: '🌐' },
    ...Object.entries(DISCUSSION_TYPES).map(([key, type]) => ({
      key,
      label: type.label,
      icon: type.icon
    })),
    { key: 'OTHER', label: 'Other', icon: '❓' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Entrepreneurial Discussions</h1>
            <p className="text-gray-600 mt-1">Collaborate, validate, and grow your ideas</p>
          </div>
          
          {/* New Discussion Button */}
          {session && (
            <Link href="/discussions/new">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center"
                title="Start a New Discussion"
              >
                <FaPlus className="mr-2" /> New Discussion
              </button>
            </Link>
          )}
        </div>

        {/* Discussion Type Tabs */}
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
                placeholder="Search discussions..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Minimum Impact Filter */}
              <div>
                <label className="block text-sm mb-1">Minimum Impact</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={filters.minImpact}
                  onChange={(e) => setFilters({...filters, minImpact: Number(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  Impact: {filters.minImpact}/5
                </div>
              </div>

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

              {/* Tags Filter */}
              <input
                type="text"
                placeholder="Filter by Tags"
                value={filters.tags}
                onChange={(e) => setFilters({...filters, tags: e.target.value})}
                className="border p-2 rounded-md"
              />
            </div>
          )}
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-blue-600">Loading discussions...</div>
          </div>
        ) : (
          <>
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-gray-600 mb-4">No discussions match your filters.</p>
                {session ? (
                  <Link href="/discussions/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                      Start a new discussion
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => signIn("google")} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Sign in to start a discussion
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post) => (
                  <Link key={post.id} href={`/discussions/${post.id}`}>
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 border-blue-500">
                      {/* Discussion Type Badge */}
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {DISCUSSION_TYPES[post.discussionType]?.icon || '❓'}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {DISCUSSION_TYPES[post.discussionType]?.label || 'Other Discussion'}
                        </span>
                      </div>

                      <h2 className="font-bold text-xl text-gray-800 hover:text-blue-600 transition">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                      
                      <div className="flex items-center mt-4 text-sm text-gray-500 space-x-4 flex-wrap">
                        {/* Author */}
                        <div className="flex items-center mr-4">
                          <span className="font-medium text-gray-700">{post.author}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center mr-4">
                          <FaCalendarAlt className="mr-1 text-gray-400" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>

                        {/* Impact */}
                        <div className="flex items-center mr-4">
                          <FaBolt className="mr-1 text-blue-500" />
                          <span>Impact: {post.potentialImpact}/5</span>
                        </div>

                        {/* Industry */}
                        {post.industry && (
                          <div className="flex items-center mr-4">
                            <FaIndustry className="mr-1 text-green-500" />
                            <span>{post.industry}</span>
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags && (
                          <div className="flex items-center">
                            <FaTags className="mr-1 text-purple-500" />
                            <span>{post.tags}</span>
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
          <Link href="/discussions/new">
            <button
              className="fixed md:hidden bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition z-10"
              title="Start a New Discussion"
            >
              <FaPlus />
            </button>
          </Link>
        )}
      </div>
    </Layout>
  );
}