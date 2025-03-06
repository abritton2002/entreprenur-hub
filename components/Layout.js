import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Layout({ children }) {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            LYKMYND
          </Link>
          <div className="flex space-x-4 items-center">
            <Link href="/discussions" className="text-blue-600 hover:text-blue-800 font-semibold">
              Discussions
            </Link>
            <Link href="/events" className="text-blue-600 hover:text-blue-800 font-semibold">
              Events
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/connections" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Connections
                </Link>
                <Link href="/profile" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Main Content with padding for the fixed navbar */}
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}