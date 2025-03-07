import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../components/Layout';

import AuthButton from "../components/AuthButton";

export default function SeedPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    // Ensure user is signed in
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Seeding failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading state
  if (status === 'loading') {
    return (
      <Layout>
        <div className="container mx-auto p-6 text-center">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  // Redirect if not signed in
  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In to Seed Database</h1>
          <button 
            
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In with Google
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Database Seeding</h1>
        <button
          onClick={handleSeed}
          disabled={isLoading}
          className={`
            ${isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-700'
            } 
            text-white font-bold py-2 px-4 rounded
          `}
        >
          {isLoading ? 'Seeding...' : 'Seed Database'}
        </button>

        {result && (
          <div className="mt-4 bg-green-100 p-4 rounded">
            <h2 className="font-bold">Seeding Result:</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 p-4 rounded text-red-800">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}