import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Profile() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-blue-700">You need to be signed in to view your profile.</p>
        <Link href="/" className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <img src={session.user.image} alt="Profile Picture" className="w-24 h-24 rounded-full border shadow-md" />
      <p className="text-xl font-semibold mt-4">{session.user.name}</p>
      <p className="text-gray-600">{session.user.email}</p>

      <button
        onClick={() => signOut()}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
      >
        Sign Out
      </button>

      <Link href="/" className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-md">
        Go Home
      </Link>
    </div>
  );
}
