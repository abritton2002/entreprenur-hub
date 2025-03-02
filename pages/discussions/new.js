import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function NewDiscussion() {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handlePost = async () => {
    if (!session) return alert("You must be signed in to post.");
    if (!title || !content) return alert("Title and content are required!");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author: session.user.name }),
      });

      if (!res.ok) throw new Error("Failed to create discussion");

      // Redirect to discussions page
      router.push("/discussions");
    } catch (error) {
      console.error("Error creating discussion:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">New Discussion</h1>

      {session ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <input
            className="border p-2 w-full rounded-md"
            placeholder="Discussion Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border p-2 w-full mt-2 rounded-md"
            placeholder="Discussion Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <button
            onClick={handlePost}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-md"
          >
            Post Discussion
          </button>
        </div>
      ) : (
        <p className="text-blue-700 text-lg font-semibold">
          Sign in to create a discussion.
        </p>
      )}
    </div>
  );
}
