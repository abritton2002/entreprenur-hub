import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch post details
      fetch(`/api/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching post:", error);
          setLoading(false);
        });

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (!post) return <div className="p-4">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link href="/discussions" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Discussions
      </Link>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>
        <div className="text-sm text-gray-500">
          Posted by {post.author} on {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        
        {session ? (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <textarea
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add Comment
            </button>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">Please sign in to comment.</p>
        )}

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white shadow rounded-lg p-4">
              <p className="text-gray-700">{comment.content}</p>
              <div className="text-sm text-gray-500 mt-2">
                {comment.author} • {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-600 text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}
