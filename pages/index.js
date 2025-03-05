import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  const { data: session } = useSession();

  const featureTiles = [
    {
      title: "Discussions",
      description: "Connect with entrepreneurs and share insights",
      href: "/discussions",
      color: "from-blue-400 to-blue-600",
      icon: "💬"
    },
    {
      title: "Impact Voting",
      description: "Validate and rate entrepreneurial ideas",
      href: "/discussions",
      color: "from-green-400 to-green-600",
      icon: "🚀"
    },
    {
      title: "Resource Sharing",
      description: "Discover tools and opportunities",
      href: "/discussions",
      color: "from-purple-400 to-purple-600",
      icon: "💡"
    },
    {
      title: "Network",
      description: "Expand your entrepreneurial connections",
      href: "/discussions",
      color: "from-indigo-400 to-indigo-600",
      icon: "🤝"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            LYKMYND
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            An entrepreneurial community for sharing ideas, validating concepts, and growing together.
          </p>
          {!session && (
            <button
              onClick={() => signIn("google")}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
            >
              Join the Community
            </button>
          )}
        </div>

        {/* Feature Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {featureTiles.map((tile, index) => (
            <Link href={tile.href} key={index}>
              <div className={`bg-gradient-to-r ${tile.color} text-white rounded-xl shadow-md p-6 h-full transition transform hover:-translate-y-1 hover:shadow-lg flex items-center`}>
                <div className="text-4xl mr-4">{tile.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{tile.title}</h2>
                  <p className="text-white text-opacity-90">{tile.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Community Stats */}
        {session && (
          <div className="mt-16 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Community Pulse</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <p className="text-3xl font-bold text-blue-600">120+</p>
                <p className="text-gray-600">Active Members</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-slate-600">56</p>
                <p className="text-gray-600">Discussions</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-teal-600">32</p>
                <p className="text-gray-600">Impact Votes</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">18</p>
                <p className="text-gray-600">Resources Shared</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}