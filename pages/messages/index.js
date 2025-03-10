// pages/messages/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { 
  FaEnvelope, 
  FaSpinner, 
  FaUserCircle, 
  FaCircle,
  FaCommentDots
} from 'react-icons/fa';

export default function Messages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Fetch conversations
  useEffect(() => {
    if (session) {
      setLoading(true);
      
      fetch('/api/messages')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load conversations');
          return res.json();
        })
        .then(data => {
          setConversations(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching conversations:', err);
          setError('Failed to load conversations. Please try again.');
          setLoading(false);
        });
    }
  }, [session]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, just show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Display loading state
  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-center h-64">
              <FaSpinner className="text-3xl text-blue-500 animate-spin" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaEnvelope className="mr-2 text-blue-600" />
              Messages
            </h1>
            <p className="text-gray-600">
              Connect with your entrepreneurial network
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
          
          {/* Conversations List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <FaCommentDots className="text-4xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h2>
                <p className="text-gray-600 mb-6">
                  Start connecting with entrepreneurs to exchange messages
                </p>
                <Link href="/connections">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Find Connections
                  </button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <li key={conversation.partner.id}>
                    <Link href={`/messages/${conversation.partner.id}`}>
                      <div className="p-4 hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex items-center">
                          {/* Avatar */}
                          <div className="flex-shrink-0 mr-4 relative">
                            {conversation.partner.image ? (
                              <img 
                                src={conversation.partner.image} 
                                alt={conversation.partner.name} 
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <FaUserCircle className="w-12 h-12 text-gray-400" />
                            )}
                            
                            {/* Unread indicator */}
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {conversation.partner.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatDate(conversation.latestMessage.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex items-center mt-1">
                              {!conversation.latestMessage.read && 
                               conversation.latestMessage.senderId === conversation.partner.id && (
                                <FaCircle className="text-blue-500 mr-1 text-xs" />
                              )}
                              <p className={`text-sm truncate ${
                                !conversation.latestMessage.read && 
                                conversation.latestMessage.senderId === conversation.partner.id
                                  ? 'font-semibold text-gray-900' 
                                  : 'text-gray-600'
                              }`}>
                                {conversation.latestMessage.content}
                              </p>
                            </div>
                            
                            {/* Optional: User role/industry */}
                            {(conversation.partner.role || conversation.partner.industry) && (
                              <div className="mt-1 text-xs text-gray-500">
                                {conversation.partner.role}
                                {conversation.partner.role && conversation.partner.industry && ' • '}
                                {conversation.partner.industry}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}