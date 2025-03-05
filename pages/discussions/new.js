import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

// Discussion type options
const DISCUSSION_TYPES = [
  { 
    value: 'GENERAL', 
    label: 'General Discussion', 
    description: 'Open-ended conversation about entrepreneurship' 
  },
  { 
    value: 'PIVOT_STRATEGY', 
    label: 'Pivot Strategy', 
    description: 'Exploring potential business model shifts' 
  },
  { 
    value: 'MVP_FEEDBACK', 
    label: 'MVP Feedback', 
    description: 'Validate your minimum viable product concept' 
  },
  { 
    value: 'RESOURCE_SHARING', 
    label: 'Resource Sharing', 
    description: 'Exchange tools, insights, and entrepreneurial resources' 
  },
  { 
    value: 'FUNDING_INSIGHTS', 
    label: 'Funding Insights', 
    description: 'Discuss fundraising strategies and investment opportunities' 
  }
];

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

export default function NewDiscussion() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [discussionType, setDiscussionType] = useState("GENERAL");
  const [tags, setTags] = useState("");
  const [industry, setIndustry] = useState("");
  const [potentialImpact, setPotentialImpact] = useState(3);

  const handlePost = async () => {
    if (!session) {
      alert("You must be signed in to post.");
      return;
    }

    if (!title || !content) {
      alert("Title and content are required!");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, 
          content, 
          discussionType,
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          industry,
          potentialImpact: Number(potentialImpact)
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create discussion");
      }

      // Redirect to discussions page
      router.push("/discussions");
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert(error.message);
    }
  };

  // If not signed in, show sign-in prompt
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Start a Discussion</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to create a new discussion and connect with other entrepreneurs.
          </p>
          <Link 
            href="/" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Start a New Discussion</h1>

        {/* Discussion Type */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Discussion Type</label>
          <select 
            value={discussionType}
            onChange={(e) => setDiscussionType(e.target.value)}
            className="w-full border p-2 rounded-md"
          >
            {DISCUSSION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Discussion Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Enter a clear and concise title"
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Discussion Details</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded-md"
            rows={6}
            placeholder="Provide detailed context for your discussion. Be specific about what you're looking to achieve or understand."
          ></textarea>
        </div>

        {/* Industry */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border p-2 rounded-md"
          >
            <option value="">Select an Industry (Optional)</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border p-2 rounded-md"
            placeholder="Add tags separated by commas (e.g. startup, funding, marketing)"
          />
          <p className="text-sm text-gray-500 mt-2">
            Tags help others find your discussion more easily
          </p>
        </div>

        {/* Potential Impact */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Potential Impact (0-5)
          </label>
          <input
            type="range"
            min="0"
            max="5"
            value={potentialImpact}
            onChange={(e) => setPotentialImpact(e.target.value)}
            className="w-full"
          />
          <div className="text-center text-gray-600 mt-2">
            Impact Score: {potentialImpact}/5
          </div>
        </div>

        {/* Post Button */}
        <button
          onClick={handlePost}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Create Discussion
        </button>
      </div>
    </div>
  );
}