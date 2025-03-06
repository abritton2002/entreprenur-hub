import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { 
  FaUser, 
  FaBuilding, 
  FaRocket, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaSearchDollar 
} from 'react-icons/fa';

// Industries list
const INDUSTRIES = [
  'Technology', 
  'SaaS', 
  'E-commerce', 
  'FinTech', 
  'Healthcare', 
  'EdTech', 
  'AI/ML', 
  'Blockchain', 
  'Sustainability', 
  'Other'
];

// Startup Stages
const STARTUP_STAGES = [
  'Idea Stage',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
  'Growth',
  'Established'
];

// Roles
const ROLES = [
  'Technical Founder',
  'Business Development',
  'Marketing',
  'Finance',
  'Product',
  'Design',
  'Operations',
  'Investor',
  'Mentor',
  'Other'
];

// Looking For
const LOOKING_FOR = [
  'Technical Co-Founder',
  'Business Co-Founder',
  'Mentorship',
  'Investment',
  'Partnership',
  'Team Members',
  'Advisors',
  'Networking',
  'Other'
];

export default function EditProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState({
    name: '',
    location: '',
    bio: '',
    skills: '',
    businessNeeds: '',
    industry: '',
    startupStage: '',
    role: '',
    lookingFor: '',
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Fetch profile data if it exists
  useEffect(() => {
    if (session) {
      setLoading(true);
      fetch('/api/profile')
        .then(res => {
          if (res.ok) return res.json();
          return { notFound: true };
        })
        .then(data => {
          if (!data.notFound) {
            // Populate profile with existing data
            setProfile({
              name: data.name || '',
              location: data.location || '',
              bio: data.bio || '',
              skills: data.skills || '',
              businessNeeds: data.businessNeeds || '',
              industry: data.industry || '',
              startupStage: data.startupStage || '',
              role: data.role || '',
              lookingFor: data.lookingFor || '',
              profileImage: data.image || session.user.image || ''
            });
          } else if (session.user) {
            // Pre-fill name from session
            setProfile(prev => ({
              ...prev,
              name: session.user.name || '',
              profileImage: session.user.image || ''
            }));
          }
        })
        .catch(err => {
          console.error('Error fetching profile:', err);
          setError('Failed to load profile data');
        })
        .finally(() => setLoading(false));
    }
  }, [session]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateProfile = () => {
    // Basic validation
    if (!profile.name.trim()) {
      setError('Name is required');
      return false;
    }

    // Optional but recommended validations
    if (profile.skills && profile.skills.split(',').length > 10) {
      setError('Maximum 10 skills allowed');
      return false;
    }

    if (profile.businessNeeds && profile.businessNeeds.split(',').length > 5) {
      setError('Maximum 5 business needs allowed');
      return false;
    }

    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(''); // Reset success message
    
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // More detailed success message
      setSuccess('Profile updated successfully! Redirecting...');
      
      // Slightly longer delay to read the success message
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'An error occurred while saving your profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-[#1E40AF] border-blue-200 rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#1E40AF] mb-8">Edit Your Profile</h1>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaUser className="mr-2 text-[#1E40AF]" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="City, State, Country"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="bio">
                    Bio / About Me
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    rows="4"
                    placeholder="Tell us about yourself, your background, and your entrepreneurial journey"
                    maxLength={500}
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.bio ? `${profile.bio.length}/500 characters` : '0/500 characters'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Rest of the form remains the same as in your previous implementation */}
            {/* Professional Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaBuilding className="mr-2 text-[#1E40AF]" />
                Professional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="industry">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={profile.industry}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="role">
                    Your Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select Your Role</option>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="e.g., programming, marketing, sales"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="startupStage">
                    Startup Stage
                  </label>
                  <select
                    id="startupStage"
                    name="startupStage"
                    value={profile.startupStage}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select Stage</option>
                    {STARTUP_STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Connection Preferences Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-2 text-[#1E40AF]" />
                Connection Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="lookingFor">
                    Looking For
                  </label>
                  <select
                    id="lookingFor"
                    name="lookingFor"
                    value={profile.lookingFor}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="">Select What You're Looking For</option>
                    {LOOKING_FOR.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="businessNeeds">
                    Business Needs (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="businessNeeds"
                    name="businessNeeds"
                    value={profile.businessNeeds}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="e.g., funding, marketing help, technical expertise"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-8 py-3 rounded-lg shadow transition
                  ${isSubmitting 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white'}
                `}
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}