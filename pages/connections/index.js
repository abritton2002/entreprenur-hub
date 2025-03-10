// pages/connections/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { 
  FaUserFriends,
  FaUserPlus,
  FaSpinner,
  FaEnvelope,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaNetworkWired,
  FaBuilding,
  FaMapMarkerAlt,
  FaCommentDots
} from 'react-icons/fa';

export default function Connections() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingInvite, setProcessingInvite] = useState(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Fetch connections and invitations data
  useEffect(() => {
    if (session) {
      setLoading(true);
      
      // Fetch connections
      fetch('/api/connections')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load connections');
          return res.json();
        })
        .then(data => {
          setConnections(data || []);
        })
        .catch(err => {
          console.error('Error fetching connections:', err);
          setError('Failed to load connections. Please try again later.');
        });
      
      // Fetch invitations
      fetch('/api/connections/invitations')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load invitations');
          return res.json();
        })
        .then(data => {
          setInvitations(data || []);
        })
        .catch(err => {
          console.error('Error fetching invitations:', err);
          setError('Failed to load invitations. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [session]);
  
  const handleInvitationResponse = async (invitationId, accept) => {
    if (!session) return;
    
    setProcessingInvite(invitationId);
    
    try {
      const res = await fetch(`/api/connections/invitations/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: accept ? 'ACCEPTED' : 'DECLINED'
        })
      });
      
      if (!res.ok) throw new Error('Failed to process invitation');
      
      // Update invitations list locally
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // If accepted, fetch updated connections
      if (accept) {
        const connectionsRes = await fetch('/api/connections');
        if (connectionsRes.ok) {
          const newConnections = await connectionsRes.json();
          setConnections(newConnections || []);
        }
      }
      
    } catch (err) {
      console.error('Error processing invitation:', err);
      setError('Failed to process invitation. Please try again.');
    } finally {
      setProcessingInvite(null);
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
              <p className="text-gray-600">Loading your network...</p>
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
            <h1 className="text-3xl font-bold mb-2">Your Entrepreneur Network</h1>
            <p className="text-blue-100">
              Build and manage your connections with fellow entrepreneurs
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
          
          {/* Network Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-[#1E40AF]">{connections.length}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              
              <div className="p-4">
                <div className="text-3xl font-bold text-[#7C3AED]">{invitations.length}</div>
                <div className="text-sm text-gray-600">Pending Invitations</div>
              </div>
              
              <div className="p-4 col-span-2 flex justify-center">
                <Link href="/connections/matches">
                  <button className="px-6 py-3 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg shadow transition flex items-center">
                    <FaUserPlus className="mr-2" />
                    Find New Connections
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('connections')}
                className={`flex-1 py-4 px-6 text-center font-medium focus:outline-none ${
                  activeTab === 'connections'
                    ? 'text-[#1E40AF] border-b-2 border-[#1E40AF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <FaUserFriends className="mr-2" />
                  Connections
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('invitations')}
                className={`flex-1 py-4 px-6 text-center font-medium focus:outline-none relative ${
                  activeTab === 'invitations'
                    ? 'text-[#1E40AF] border-b-2 border-[#1E40AF]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  <FaEnvelope className="mr-2" />
                  Invitations
                  {invitations.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {invitations.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'connections' && (
                <>
                  {connections.length === 0 ? (
                    <div className="text-center py-10">
                      <FaNetworkWired className="text-5xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Connections Yet</h3>
                      <p className="text-gray-500 mb-6">
                        Start building your network by finding entrepreneurs that match your profile.
                      </p>
                      <Link href="/connections/matches">
                        <button className="px-6 py-3 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold rounded-lg shadow transition">
                          Find Entrepreneurs
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {connections.map((connection) => (
                        <div key={connection.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center">
                          {/* Profile Image / Avatar */}
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                              {connection.user?.image ? (
                                <img 
                                  src={connection.user.image} 
                                  alt={connection.user.name} 
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Connection Details */}
                          <div className="flex-grow mt-4 md:mt-0">
                            <h3 className="font-semibold text-gray-800">{connection.user?.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {connection.user?.role && (
                                <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                  {connection.user.role}
                                </span>
                              )}
                              
                              {connection.user?.industry && (
                                <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                  <FaBuilding className="mr-1" />
                                  {connection.user.industry}
                                </span>
                              )}
                              
                              {connection.user?.location && (
                                <span className="inline-flex items-center text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                                  <FaMapMarkerAlt className="mr-1" />
                                  {connection.user.location}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-4 md:mt-0 md:ml-4 flex">
                            <Link href={`/profile/${connection.user?.id}`}>
                              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mr-2">
                                View Profile
                              </button>
                            </Link>
                            
                            {/* Message Button (only for accepted connections) */}
                            {connection.status === 'ACCEPTED' && (
                              <Link href={`/messages/${connection.user?.id}`}>
                                <button className="px-4 py-2 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white rounded-lg flex items-center">
                                  <FaCommentDots className="mr-2" /> Message
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'invitations' && (
                <>
                  {invitations.length === 0 ? (
                    <div className="text-center py-10">
                      <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Invitations</h3>
                      <p className="text-gray-500">
                        You don't have any pending connection invitations at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center">
                          {/* Profile Image / Avatar */}
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                              {invitation.sender?.image ? (
                                <img 
                                  src={invitation.sender.image} 
                                  alt={invitation.sender.name} 
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Invitation Details */}
                          <div className="flex-grow mt-4 md:mt-0">
                            <h3 className="font-semibold text-gray-800">{invitation.sender?.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {invitation.sender?.role && (
                                <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                  {invitation.sender.role}
                                </span>
                              )}
                              
                              {invitation.sender?.industry && (
                                <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                  <FaBuilding className="mr-1" />
                                  {invitation.sender.industry}
                                </span>
                              )}
                            </div>
                            
                            {invitation.message && (
                              <p className="text-gray-600 text-sm mt-2 italic">
                                "{invitation.message}"
                              </p>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-4 md:mt-0 md:ml-4 flex space-x-2">
                            <button
                              onClick={() => handleInvitationResponse(invitation.id, false)}
                              disabled={processingInvite === invitation.id}
                              className={`px-4 py-2 rounded-lg flex items-center ${
                                processingInvite === invitation.id
                                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {processingInvite === invitation.id ? (
                                <FaSpinner className="animate-spin mr-2" />
                              ) : (
                                <FaTimesCircle className="mr-2 text-red-500" />
                              )}
                              Decline
                            </button>
                            
                            <button
                              onClick={() => handleInvitationResponse(invitation.id, true)}
                              disabled={processingInvite === invitation.id}
                              className={`px-4 py-2 rounded-lg flex items-center ${
                                processingInvite === invitation.id
                                  ? 'bg-blue-400 text-white cursor-wait'
                                  : 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white'
                              }`}
                            >
                              {processingInvite === invitation.id ? (
                                <FaSpinner className="animate-spin mr-2" />
                              ) : (
                                <FaCheckCircle className="mr-2" />
                              )}
                              Accept
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}