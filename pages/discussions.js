import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { 
  FaPlus, 
  FaComment, 
  FaCalendarAlt, 
  FaBolt,
  FaFilter,
  FaIndustry,
  FaTags,
  FaSearch,
  FaLightbulb,
  FaExchangeAlt,
  FaShareAlt,
  FaMoneyBillWave,
  FaGlobe,
  FaQuestionCircle
} from "react-icons/fa";
import Layout from "../components/Layout";

// Discussion type mapping with more details
const DISCUSSION_TYPES = {
  GENERAL: { 
    label: 'General Discussion', 
    description: 'Open conversations for entrepreneurs',
    icon: <FaComment className="text-[#0EA5E9]" />,
    color: "#0EA5E9" // Secondary blue
  },
  PIVOT_STRATEGY: { 
    label: 'Pivot Strategy', 
    description: 'Explore business model transformations',
    icon: <FaExchangeAlt className="text-[#6366F1]" />,
    color: "#6366F1" // Indigo
  },
  MVP_FEEDBACK: { 
    label: 'MVP Feedback', 
    description: 'Validate and refine product concepts',
    icon: <FaLightbulb className="text-[#F59E0B]" />,
    color: "#F59E0B" // Amber
  },
  RESOURCE_SHARING: { 
    label: 'Resource Sharing', 
    description: 'Tools, guides, and entrepreneurial resources',
    icon: <FaShareAlt className="text-[#10B981]" />,
    color: "#10B981" // Green
  },
  FUNDING_INSIGHTS: { 
    label: 'Funding Insights', 
    description: 'Fundraising strategies and investment opportunities',
    icon: <FaMoneyBillWave className="text-[#7C3AED]" />,
    color: "#7C3AED" // Purple
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
    { key: 'ALL', label: 'All Discussions', icon: <FaGlobe className="text-[#1E40AF]" /> },
    ...Object.entries(DISCUSSION_TYPES).map(([key, type]) => ({
      key,
      label: type.label,
      icon: type.icon
    })),
    { key: 'OTHER', label: 'Other', icon: <FaQuestionCircle className="text-gray-500" /> }
  ];

  return (
    <Layout>
      {/* Page Hero Section */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#6366F1] py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-white">Entrepreneurial Discussions</h1>
            <p className="text-xl text-blue-100">Connect, collaborate, and grow your ideas with peer feedback</p>
            
            {session && (
              <Link href="/discussions/new">
                <button className="mt-6 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow-lg transition flex items-center">
                  <FaPlus className="mr-2" /> Start a New Discussion
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
        {/* Discussion Type Tabs - improved accessibility and visual distinction */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <h2 className="sr-only">Filter by Discussion Type</h2>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${activeTab === tab.key 
                    ? 'bg-[#1E40AF] text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                `}
                aria-pressed={activeTab === tab.key}
                aria-label={`Filter by ${tab.label}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
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
                placeholder="Search discussions..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search discussions"
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
              <Link href="/discussions/new" className="ml-auto hidden lg:block">
                <button className="px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg shadow transition flex items-center">
                  <FaPlus className="mr-2" /> New Discussion
                </button>
              </Link>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div id="advanced-filters" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {/* Minimum Impact Filter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Impact Score</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={filters.minImpact}
                  onChange={(e) => setFilters({...filters, minImpact: Number(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                  aria-label="Minimum impact score filter"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Low Impact (0)</span>
                  <span className="font-semibold text-[#7C3AED]">{filters.minImpact}</span>
                  <span>High Impact (5)</span>
                </div>
              </div>

              {/* Industry Filter */}
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

              {/* Tags Filter */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label htmlFor="tags-filter" className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  id="tags-filter"
                  type="text"
                  placeholder="Search by tags (e.g. startup, funding)"
                  value={filters.tags}
                  onChange={(e) => setFilters({...filters, tags: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results summary */}
        {!loading && (
          <div className="mb-4 text-gray-600">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'discussion' : 'discussions'}
            {activeTab !== 'ALL' && ` in ${activeTab === 'OTHER' ? 'Other Categories' : DISCUSSION_TYPES[activeTab]?.label}`}
            {filters.industry && ` for ${filters.industry} industry`}
            {filters.tags && ` with tags containing "${filters.tags}"`}
            {filters.minImpact > 0 && ` with impact score ${filters.minImpact}+`}
          </div>
        )}

        {/* Discussions List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm p-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-[#1E40AF] border-blue-200 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading discussions...</p>
            </div>
          </div>
        ) : (
          <>
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">No discussions found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or start a new discussion</p>
                {session ? (
                  <Link href="/discussions/new">
                    <button className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow transition">
                      Start a new discussion
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => signIn("google")} 
                    className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow transition"
                  >
                    Sign in to start a discussion
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post) => {
                  const discussionType = DISCUSSION_TYPES[post.discussionType] || {
                    icon: <FaQuestionCircle className="text-gray-500" />,
                    label: 'Other Discussion',
                    color: "#64748B" // Slate
                  };
                  
                  return (
                    <Link key={post.id} href={`/discussions/${post.id}`}>
                      <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 cursor-pointer" 
                        style={{ borderLeftColor: discussionType.color }}
                      >
                        <div className="flex items-start">
                          {/* Left column - Type icon */}
                          <div className="hidden sm:block mr-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                              style={{ backgroundColor: `${discussionType.color}15` }}
                            >
                              {discussionType.icon}
                            </div>
                          </div>
                          
                          {/* Right column - Content */}
                          <div className="flex-1">
                            {/* Discussion Type Badge and Author */}
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                              <div className="flex items-center">
                                <span className="sm:hidden mr-2">
                                  {discussionType.icon}
                                </span>
                                <span className="text-sm font-semibold px-3 py-1 rounded-full" 
                                  style={{ 
                                    backgroundColor: `${discussionType.color}15`,
                                    color: discussionType.color 
                                  }}
                                >
                                  {discussionType.label}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-500 text-sm">
                                <span className="font-medium">{post.author}</span>
                                <span className="mx-2">•</span>
                                <FaCalendarAlt className="mr-1" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>

                            {/* Title and Content */}
                            <h2 className="font-bold text-xl text-gray-800 group-hover:text-[#1E40AF] transition mb-2">
                              {post.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
                            
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              {/* Impact */}
                              <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                <FaBolt className="mr-1" />
                                <span>Impact: {post.potentialImpact}/5</span>
                              </div>

                              {/* Industry */}
                              {post.industry && (
                                <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full">
                                  <FaIndustry className="mr-1" />
                                  <span>{post.industry}</span>
                                </div>
                              )}

                              {/* Tags */}
                              {post.tags && (
                                <div className="flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                                  <FaTags className="mr-1" />
                                  <span className="truncate max-w-[150px]">{post.tags}</span>
                                </div>
                              )}
                              
                              {/* Comments count */}
                              {post.commentCount !== undefined && (
                                <div className="flex items-center px-3 py-1 bg-gray-50 text-gray-700 rounded-full ml-auto">
                                  <FaComment className="mr-1" />
                                  <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
                                </div>
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
          <Link href="/discussions/new">
            <button
              className="fixed md:hidden bottom-6 right-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-4 rounded-full shadow-lg transition z-10"
              title="Start a New Discussion"
              aria-label="Start a New Discussion"
            >
              <FaPlus size={20} />
            </button>
          </Link>
        )}
      </div>
    </Layout>
  );
}