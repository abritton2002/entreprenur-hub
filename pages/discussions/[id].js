import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!id) return;

    // Fetch post
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then(setPost)
      .catch((error) => console.error("Error fetching post:", error));

      // Fetch comments
      fetch(`/api/comments/${id}`)
        .then(res => res.json())
        .then(setComments)
        .catch(error => console.error("Error fetching comments:", error));
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session) return;

    try {
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

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
        <p className="mt-2">{post.content}</p>
        <small className="text-gray-500">By {post.author}</small>
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
  );
}
