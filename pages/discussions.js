import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaPlus, FaComment, FaThumbsUp, FaCalendarAlt } from "react-icons/fa";
import Layout from "../components/Layout";

export default function Discussions() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Discussions</h1>
            <p className="text-gray-600 mt-1">Share your thoughts and connect with others</p>
          </div>
          
          {/* New Discussion Button (visible only for signed-in users) */}
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

        {loading ? (
          // Loading state
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-blue-600">Loading discussions...</div>
          </div>
        ) : (
          // Discussions List
          <>
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-gray-600 mb-4">No discussions yet.</p>
                {session ? (
                  <Link href="/discussions/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                      Start the first discussion
                    </button>
                  </Link>
                ) : (
                  <button onClick={() => signIn("google")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    Sign in to start a discussion
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} href={`/discussions/${post.id}`}>
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 border-blue-500">
                      <h2 className="font-bold text-xl text-gray-800 hover:text-blue-600 transition">{post.title}</h2>
                      <p className="text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                      
                      <div className="flex items-center mt-4 text-sm text-gray-500">
                        <div className="flex items-center mr-6">
                          <span className="font-medium text-gray-700">{post.author}</span>
                        </div>
                        <div className="flex items-center mr-6">
                          <FaCalendarAlt className="mr-1 text-gray-400" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center mr-6">
                          <FaThumbsUp className="mr-1 text-blue-500" />
                          <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FaComment className="mr-1 text-gray-400" />
                          <span>0 comments</span>
                        </div>
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