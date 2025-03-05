import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  const { data: session } = useSession();

  const featureTiles = [
    {
      title: "Connect",
      description: "Meet other LYKMYNDERS and expand your network",
      href: "/connect",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Seek Advice",
      description: "Get wisdom and guidance from experienced minds",
      href: "/advice",
      color: "from-slate-500 to-slate-700"
    },
    {
      title: "Discuss",
      description: "Talk through ideas and challenges with peers",
      href: "/discussions",
      color: "from-teal-500 to-teal-700"
    },
    {
      title: "Opportunities",
      description: "Discover ventures and collaboration possibilities",
      href: "/opportunities",
      color: "from-indigo-500 to-indigo-700"
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
            Connect with like-minded individuals, share ideas, and discover new opportunities together.
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
              <div className={`bg-gradient-to-r ${tile.color} text-white rounded-xl shadow-md p-6 h-full transition transform hover:-translate-y-1 hover:shadow-lg`}>
                <h2 className="text-2xl font-bold mb-2">{tile.title}</h2>
                <p className="text-white text-opacity-90">{tile.description}</p>
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
                <p className="text-gray-600">Advice Sessions</p>
              </div>
              <div className="p-4">
                <p className="text-3xl font-bold text-indigo-600">18</p>
                <p className="text-gray-600">Opportunities</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}