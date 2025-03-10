// pages/messages/[partnerId].js
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaSpinner, 
  FaUserCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function Conversation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { partnerId } = router.query;
  
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Fetch conversation and partner details
  useEffect(() => {
    if (session && partnerId) {
      setLoading(true);
      setError('');
      
      // Fetch partner details
      fetch(`/api/users/${partnerId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load user details');
          return res.json();
        })
        .then(data => {
          setPartner(data);
        })
        .catch(err => {
          console.error('Error fetching partner details:', err);
          setError('Failed to load contact information.');
        });
      
      // Fetch messages
      fetch(`/api/messages/${partnerId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load messages');
          return res.json();
        })
        .then(data => {
          setMessages(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages. Please try again.');
          setLoading(false);
        });
    }
  }, [session, partnerId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: partnerId,
          content: newMessage
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const sentMessage = await res.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };
  
  // Display loading state
  if (status === 'loading' || (loading && !error)) {
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
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center">
            <Link href="/messages">
              <button className="text-white mr-4">
                <FaArrowLeft className="text-xl" />
              </button>
            </Link>
            
            <div className="flex items-center">
              {partner?.image ? (
                <img 
                  src={partner.image} 
                  alt={partner?.name || 'Contact'} 
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-white mr-3" />
              )}
              
              <div>
                <h2 className="text-lg font-bold text-white">
                  {partner?.name || 'Loading...'}
                </h2>
                {partner?.role && (
                  <p className="text-xs text-blue-100">
                    {partner.role}
                    {partner.industry && ` • ${partner.industry}`}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 flex items-center">
              <FaExclamationCircle className="mr-2" />
              {error}
            </div>
          )}
          
          {/* Messages Container */}
          <div className="p-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-blue-500 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600 max-w-xs">
                  Say hello and start building your entrepreneurial connection
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.sender.id === session.user.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 mr-2">
                          {message.sender.image ? (
                            <img 
                              src={message.sender.image} 
                              alt={message.sender.name} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 border p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className={`px-4 py-2 rounded-r-lg ${
                  !newMessage.trim() || sending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}