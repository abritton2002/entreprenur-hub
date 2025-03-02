import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default function Discussions() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch discussions from the API
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch((error) => console.error("Error fetching discussions:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Discussions</h1>

        {/* Floating Add Discussion Button */}
        {session && (
          <button
            onClick={() => alert("Draft discussion feature coming soon!")}
            className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
            title="Start a New Discussion"
          >
            <FaPlus size={20} />
          </button>
        )}
      </div>

      {/* Discussions List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-600 text-center">No discussions yet. Start one!</p>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/discussions/${post.id}`} passHref>
              <div className="bg-white shadow-md rounded-lg p-5 transition hover:shadow-lg cursor-pointer">
                <h2 className="font-semibold text-lg text-gray-800">{post.title}</h2>
                <p className="text-sm text-gray-600 mt-1 truncate">{post.content}</p>
                <small className="text-gray-500 block mt-2">By {post.author}</small>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
