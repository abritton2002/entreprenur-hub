// pages/connections/matches.js
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { 
  FaUserPlus,
  FaSpinner,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserCircle,
  FaHandshake,
  FaSearch,
  FaLightbulb,
  FaNetworkWired,
  FaTimes,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationCircle
} from 'react-icons/fa';

export default function Matches() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [inviting, setInviting] = useState(null); // Track which user is being invited
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Fetch matches data
  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch('/api/matches')
        .then(res => {
          if (res.status === 404) {
            setIsProfileComplete(false);
            throw new Error('Profile not found');
          }
          if (!res.ok) throw new Error('Failed to load matches');
          return res.json();
        })
        .then(data => {
          setMatches(data);
        })
        .catch(err => {
          console.error('Error fetching matches:', err);
          if (err.message !== 'Profile not found') {
            setError('Failed to load matches. Please try again later.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);
  
  const handleSendInvite = async (matchId) => {
    if (!session) return;
    
    setInviting(matchId);
    
    try {
      const res = await fetch('/api/connections/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toUserId: matchId,
          message: `I'd like to connect with you on LYKMYND!`
        })
      });
      
      if (!res.ok) throw new Error('Failed to send invitation');
      
      // Update the match status locally
      setMatches(prev => 
        prev.map(match => 
          match.profile.id === matchId 
            ? {...match, invited: true} 
            : match
        )
      );
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviting(null);
    }
  };
  
  // If loading
  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="container mx-auto max-w-5xl bg-white rounded-xl shadow-md p-8">
            <div className="flex flex-col items-center justify-center py-10">
              <FaSpinner className="text-5xl text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading your matches...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If profile is incomplete
  if (!isProfileComplete) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="container mx-auto max-w-5xl bg-white rounded-xl shadow-md p-8">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FaExclamationCircle className="text-5xl text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                To get matched with other entrepreneurs, you need to complete your profile first.
              </p>
              <Link href="/profile/edit">
                <button className="px-6 py-3 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold rounded-lg shadow transition">
                  Complete Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto max-w-5xl">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#6366F1] rounded-xl shadow-md p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Your Entrepreneur Matches</h1>
            <p className="text-blue-100">
              Connect with these entrepreneurs who match your profile, skills, and goals
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
          
          {/* Matches Grid */}
          {matches.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <FaSearch className="text-5xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matches Yet</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  We're still looking for the perfect matches for you. Check back soon or update your profile to improve matching.
                </p>
                <Link href="/profile/edit">
                  <button className="px-6 py-3 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold rounded-lg shadow transition">
                    Update Profile
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {matches.map((match) => (
                <div key={match.profile.id} className="bg-white rounded-xl shadow-md overflow-hidden transition transform hover:shadow-lg">
                  <div className="border-l-4 border-[#6366F1]">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center">
                        {/* Profile Image / Avatar */}
                        <div className="flex-shrink-0 mr-6">
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            {match.profile.profileImage ? (
                              <img 
                                src={match.profile.profileImage} 
                                alt={match.profile.name} 
                                className="w-20 h-20 rounded-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="w-16 h-16 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Profile Details */}
                        <div className="flex-grow mt-4 md:mt-0">
                          <h2 className="text-xl font-bold text-gray-800">{match.profile.name}</h2>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {match.profile.role && (
                              <span className="inline-flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                <FaUserCircle className="mr-1" />
                                {match.profile.role}
                              </span>
                            )}
                            
                            {match.profile.industry && (
                              <span className="inline-flex items-center text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                <FaBuilding className="mr-1" />
                                {match.profile.industry}
                              </span>
                            )}
                            
                            {match.profile.location && (
                              <span className="inline-flex items-center text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                                <FaMapMarkerAlt className="mr-1" />
                                {match.profile.location}
                              </span>
                            )}
                            
                            {match.profile.lookingFor && (
                              <span className="inline-flex items-center text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                                <FaSearch className="mr-1" />
                                Looking for: {match.profile.lookingFor}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Match Score & Action Button */}
                        <div className="flex flex-col items-center mt-4 md:mt-0 md:ml-4">
                          <div className="text-center mb-3">
                            <div className="text-2xl font-bold text-[#7C3AED]">{Math.round(match.score)}%</div>
                            <div className="text-sm text-gray-500">Match</div>
                          </div>
                          
                          {match.invited ? (
                            <button
                              className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center cursor-default"
                              disabled
                            >
                              <FaCheckCircle className="mr-2" />
                              Invited
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendInvite(match.profile.id)}
                              disabled={inviting === match.profile.id}
                              className={`w-full px-4 py-2 rounded-lg shadow-sm flex items-center justify-center ${
                                inviting === match.profile.id
                                  ? 'bg-blue-400 text-white cursor-wait'
                                  : 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white'
                              }`}
                            >
                              {inviting === match.profile.id ? (
                                <>
                                  <FaSpinner className="animate-spin mr-2" />
                                  Inviting...
                                </>
                              ) : (
                                <>
                                  <FaUserPlus className="mr-2" />
                                  Connect
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Match Reasons */}
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                          <FaLightbulb className="text-yellow-500 mr-2" />
                          Why you match:
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <ul className="text-sm text-gray-700 space-y-2">
                            {match.reasons.map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <span className="inline-block mr-2 mt-0.5">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}