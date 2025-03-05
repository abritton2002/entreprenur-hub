import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  FaThumbsUp, 
  FaCalendarAlt, 
  FaIndustry, 
  FaChartLine,
  FaTags,
  FaBolt,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";

// Discussion type mapping
const DISCUSSION_TYPE_ICONS = {
  PIVOT_STRATEGY: { icon: '🔄', label: 'Pivot Strategy' },
  MVP_FEEDBACK: { icon: '🚀', label: 'MVP Feedback' },
  RESOURCE_SHARING: { icon: '💡', label: 'Resource Sharing' },
  FUNDING_INSIGHTS: { icon: '💰', label: 'Funding Insights' },
  GENERAL: { icon: '💬', label: 'General Discussion' }
};

export default function Discussion() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch post details
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then(setPost)
      .catch((error) => console.error("Error fetching post:", error));

    // Fetch comments
    fetch(`/api/comments/${id}`)
      .then((res) => res.json())
      .then(setComments)
      .catch((error) => console.error("Error fetching comments:", error));
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!newComment) return alert("Comment cannot be empty!");
    if (!session) return alert("You must be signed in to comment.");

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, author: session.user.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setComments([...comments, data]); // Update UI with new comment
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error.message);
    }
  };

  const handleImpactVote = async (voteValue) => {
    if (!session) {
      alert("You must be signed in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const res = await fetch(`/api/posts/${id}/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voteValue: voteValue,
          currentValue: post.potentialImpact
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Update local state with new impact score
        setPost(prev => ({
          ...prev, 
          potentialImpact: data.newImpactScore
        }));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error voting on impact:", error);
      alert("Failed to submit vote");
    } finally {
      setIsVoting(false);
    }
  };

  if (!post) return <p className="text-center text-gray-500">Loading...</p>;

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto">
        {/* Discussion Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          {/* Discussion Type Badge */}
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">
              {DISCUSSION_TYPE_ICONS[post.discussionType].icon}
            </span>
            <span className="font-semibold text-gray-600">
              {DISCUSSION_TYPE_ICONS[post.discussionType].label}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          
          {/* Discussion Metadata */}
          <div className="flex items-center text-gray-600 mb-4 space-x-4">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            
            {post.industry && (
              <div className="flex items-center">
                <FaIndustry className="mr-2" />
                <span>{post.industry}</span>
              </div>
            )}
          </div>

          {/* Discussion Content */}
          <p className="text-gray-700 mb-6">{post.content}</p>

          {/* Impact Voting Section */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleImpactVote(post.potentialImpact + 1)}
                disabled={isVoting || !session}
                className={`mb-2 ${
                  !session ? 'text-gray-400 cursor-not-allowed' : 
                  'text-blue-600 hover:text-blue-800'
                }`}
              >
                <FaChevronUp size={24} />
              </button>
              <div className="text-2xl font-bold text-blue-700">
                {post.potentialImpact}/5
              </div>
              <button 
                onClick={() => handleImpactVote(post.potentialImpact - 1)}
                disabled={isVoting || !session}
                className={`mt-2 ${
                  !session ? 'text-gray-400 cursor-not-allowed' : 
                  'text-blue-600 hover:text-blue-800'
                }`}
              >
                <FaChevronDown size={24} />
              </button>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg flex-grow">
              <div className="flex items-center">
                <FaBolt className="mr-2 text-blue-600" />
                <span className="font-semibold">Impact Score</span>
              </div>
              <p className="text-gray-600">
                {session 
                  ? "Click the arrows to validate this discussion's potential impact." 
                  : "Sign in to vote on the discussion's impact."}
              </p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {post.tags && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <FaTags className="mr-2 text-green-600" />
                  <span className="font-semibold">Tags</span>
                </div>
                <div className="text-sm text-green-700">
                  {post.tags}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Comments ({comments.length})
          </h2>

          {session ? (
            <div className="mb-6">
              <textarea
                className="border p-2 w-full rounded-md"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button
                onClick={handleCommentSubmit}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md"
              >
                Post Comment
              </button>
            </div>
          ) : (
            <p className="text-blue-700 text-lg font-semibold">
              Sign in to leave a comment.
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-center">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="bg-gray-50 shadow-sm rounded-lg p-4"
                >
                  <p className="text-gray-800">{comment.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    By {comment.author} on {formatDate(comment.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
