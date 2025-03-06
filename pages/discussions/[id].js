import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from '../../components/Layout';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      
      // Fetch discussion details - using the correct API endpoints
      fetch(`/api/posts/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch discussion: ${res.status}`);
          }
          return res.json();
        })
        .then(setDiscussion)
        .catch(error => {
          console.error("Error fetching discussion:", error);
          setError("Failed to load discussion. Please try again later.");
        })
        .finally(() => setIsLoading(false));
      
      // Fetch comments - using the correct API endpoint
      fetch(`/api/comments/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch comments: ${res.status}`);
          }
          return res.json();
        })
        .then(setComments)
        .catch(error => console.error("Error fetching comments:", error));
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/comments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          author: session.user.name || "Anonymous"
        }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const comment = await res.json();
      setComments(prev => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImpactVote = async (voteValue) => {
    if (!session) {
      alert("You must be signed in to vote");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${id}/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voteValue: voteValue,
          currentValue: discussion.potentialImpact
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Update local state with new impact score
        setDiscussion(prev => ({
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-500">Loading discussion...</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-red-500">Error</h1>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    </Layout>
  );

  if (!discussion) return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Discussion not found</h1>
          <p className="mt-2">The discussion you're looking for could not be found.</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{discussion.title}</h1>
          <p className="mt-2">{discussion.content}</p>
          <small className="text-gray-500">By {discussion.author}</small>
          
          {/* Impact Rating */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700">Potential Impact: {discussion.potentialImpact}/5</h3>
            {session && (
              <div className="mt-2 flex space-x-2">
                <p className="text-sm text-gray-600 mr-2">Your rating:</p>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleImpactVote(rating)}
                    className={`h-8 w-8 rounded-full ${
                      discussion.potentialImpact >= rating
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800">Comments</h2>

          {session ? (
            <div className="mt-4">
              <textarea
                className="border p-2 w-full rounded-md"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button
                onClick={handleAddComment}
                disabled={isSubmitting}
                className={`mt-3 ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white px-5 py-2 rounded-md shadow-md`}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          ) : (
            <p className="text-blue-700 text-lg font-semibold mt-4">
              Sign in to leave a comment.
            </p>
          )}

          <div className="mt-5 space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-center">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 shadow-md rounded-lg p-4">
                  <p>{comment.content}</p>
                  <small className="text-gray-500">By {comment.author}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}