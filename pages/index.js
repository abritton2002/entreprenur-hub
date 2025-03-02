import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 via-blue-300 to-gray-100 text-gray-900">
      {/* Navbar */}
      <nav className="absolute top-5 right-10 flex space-x-4">
        <Link href="/discussions" className="text-blue-700 hover:text-blue-900 font-semibold">
          Discussions
        </Link>
        {session && (
          <Link href="/profile" className="text-blue-700 hover:text-blue-900 font-semibold">
            Profile
          </Link>
        )}
      </nav>

      {/* Branding */}
      <h1 className="text-5xl font-bold mb-6 drop-shadow-lg tracking-wide text-gray-800">
        LYKMYND
      </h1>
      <p className="text-lg text-gray-700 mb-6">Connect. Discuss. Innovate.</p>

      {/* Authentication Buttons */}
      {session ? (
        <div className="text-center">
          <p className="text-lg font-semibold">Welcome, {session.user.name}!</p>
          <button
            onClick={() => signOut()}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-lg transition"
        >
          Sign In with Google
        </button>
      )}
    </div>
  );
}
