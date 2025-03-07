import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  FaArrowRight, 
  FaLightbulb,
  FaComments, 
  FaRocket, 
  FaHandshake, 
  FaChartLine,
  FaLaptopCode,
  FaTools,
  FaUsers,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import AuthButton from "../components/AuthButton";

export default function ResearchBasedLandingPage() {
  const { data: session } = useSession();

  // Color palette based on research for entrepreneur engagement
  // Primary: #1E40AF (Deep blue - trust, reliability)
  // Secondary: #0EA5E9 (Bright blue - modern, tech)
  // Accent: #6366F1 (Indigo - creativity, innovation)
  // Neutral: #F8FAFC (Light background - clean, professional)
  // CTA: #7C3AED (Purple - premium, standout)

  const featureCards = [
    {
      title: "Discussions",
      description: "Connect with entrepreneurs and share insights",
      href: "/discussions",
      icon: <FaComments className="w-6 h-6" />,
      color: "#0EA5E9" // Secondary blue for communication
    },
    {
      title: "Impact Voting",
      description: "Validate and rate entrepreneurial ideas",
      href: "/discussions",
      icon: <FaRocket className="w-6 h-6" />,
      color: "#7C3AED" // Purple for innovation
    },
    {
      title: "Resource Sharing",
      description: "Discover tools and opportunities for growth",
      href: "/discussions",
      icon: <FaTools className="w-6 h-6" />,
      color: "#6366F1" // Indigo for creativity
    },
    {
      title: "Network",
      description: "Expand your entrepreneurial connections",
      href: "/connections",
      icon: <FaHandshake className="w-6 h-6" />,
      color: "#1E40AF" // Primary blue for trust
    }
  ];

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items - research shows 4-6 items is optimal
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Discussions", href: "/discussions" },
    { name: "Events", href: "/events" },
    { name: "Connections", href: "/connections" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation Bar - Research shows sticky navigation increases engagement and conversions */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/">
              <div className="font-bold text-2xl text-[#1E40AF] tracking-tight cursor-pointer">
                LYKMYND
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link href={item.href} key={item.name}>
                  <span className="text-gray-700 hover:text-[#0EA5E9] font-medium cursor-pointer transition-colors duration-200">
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Auth Button - Desktop */}
            <div className="hidden md:block">
              {session ? (
                <Link href="/profile">
                  <button className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    My Profile
                  </button>
                </Link>
              ) : (
                <AuthButton className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                  Sign In
                </AuthButton>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-[#0EA5E9] transition-colors duration-200"
              >
                {mobileMenuOpen ? 
                  <FaTimes className="h-6 w-6" /> : 
                  <FaBars className="h-6 w-6" />
                }
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <span 
                      className="text-gray-700 hover:text-[#0EA5E9] font-medium block cursor-pointer transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </span>
                  </Link>
                ))}
                {!session && (
                  <AuthButton 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-left"
                  >
                    Sign In
                  </AuthButton>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Research shows clean interfaces with strategic color usage optimize engagement */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E40AF] to-[#6366F1]">
        {/* Organic background elements - research shows visual interest increases session duration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-10 left-0 w-64 h-64 bg-[#7C3AED] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
        
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
              LYKMYND
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              An entrepreneurial community for sharing ideas, validating concepts, and growing together.
            </p>
            
            {!session ? (
              <AuthButton className="px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center">
                Join the Community <FaArrowRight className="ml-2" />
              </AuthButton>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/discussions">
                  <button className="px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center justify-center">
                    Browse Discussions <FaArrowRight className="ml-2" />
                  </button>
                </Link>
                <Link href="/events">
                  <button className="px-8 py-4 bg-white text-[#1E40AF] font-semibold rounded-lg shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center justify-center">
                    Explore Events <FaArrowRight className="ml-2" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Wave separator - creates organic flow between sections */}
        <svg className="fill-[#F8FAFC] w-full h-24 -mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path d="M0,96L48,117.3C96,139,192,181,288,186.7C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Feature Cards Section - Research shows complementary colors increase engagement */}
      <div className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-[#1E40AF]">How We Empower Entrepreneurs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featureCards.map((card, index) => (
              <Link href={card.href} key={index}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="h-2 w-full" style={{ backgroundColor: card.color }}></div>
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${card.color}15` }}>
                        <div className="transform group-hover:scale-110 transition-transform duration-300" style={{ color: card.color }}>
                          {card.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#0EA5E9] transition-colors duration-300">{card.title}</h3>
                        <p className="text-gray-600">{card.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition Section - Based on research showing entrepreneurs value balance of professionalism and innovation */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-[#1E40AF]">Why Entrepreneurs Choose LYKMYND</h2>
                <div className="space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#0EA5E9] bg-opacity-10 text-[#0EA5E9]">
                        <FaLightbulb className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-gray-800">Idea Validation</h3>
                      <p className="mt-2 text-gray-600">Get real feedback from fellow entrepreneurs to refine your concept and validate your market fit.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#6366F1] bg-opacity-10 text-[#6366F1]">
                        <FaHandshake className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-gray-800">Meaningful Connections</h3>
                      <p className="mt-2 text-gray-600">Build relationships with like-minded individuals who understand your entrepreneurial journey.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#7C3AED] bg-opacity-10 text-[#7C3AED]">
                        <FaChartLine className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-gray-800">Growth Acceleration</h3>
                      <p className="mt-2 text-gray-600">Access resources and insights that help you scale faster and smarter in today's competitive market.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial - Research shows social proof increases trust */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-lg shadow-lg p-8 border border-gray-100 relative">
                <div className="absolute -top-3 -left-3">
                  <div className="text-[#7C3AED] text-4xl">❝</div>
                </div>
                <div className="pt-4">
                  <p className="text-gray-700 italic mb-6 text-lg">
                    "LYKMYND has been instrumental in helping me validate my business concept and find the right partnerships. The feedback I received shaped my product roadmap significantly, and the connections I've made continue to be invaluable."
                  </p>
                  <div className="flex items-center mt-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] rounded-full mr-4"></div>
                    <div>
                      <div className="font-semibold text-gray-800">Sarah Chen</div>
                      <div className="text-gray-500 text-sm">Founder, TechStart Solutions</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3">
                  <div className="text-[#7C3AED] text-4xl">❞</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats - Based on research showing entrepreneurs respond to data-driven decisions */}
      {session && (
        <div className="py-16 bg-[#F8FAFC]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-16 text-center text-[#1E40AF]">Community Pulse</h2>
            
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 mx-auto bg-[#0EA5E9] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <FaUsers className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <div className="text-4xl font-bold text-[#1E40AF] mb-2">120+</div>
                <div className="text-gray-600">Active Members</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 mx-auto bg-[#1E40AF] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <FaComments className="w-8 h-8 text-[#1E40AF]" />
                </div>
                <div className="text-4xl font-bold text-[#1E40AF] mb-2">56</div>
                <div className="text-gray-600">Discussions</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 mx-auto bg-[#7C3AED] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <FaRocket className="w-8 h-8 text-[#7C3AED]" />
                </div>
                <div className="text-4xl font-bold text-[#1E40AF] mb-2">32</div>
                <div className="text-gray-600">Impact Votes</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 mx-auto bg-[#6366F1] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  <FaLaptopCode className="w-8 h-8 text-[#6366F1]" />
                </div>
                <div className="text-4xl font-bold text-[#1E40AF] mb-2">18</div>
                <div className="text-gray-600">Resources Shared</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section - Using research that shows purple CTAs signal premium quality */}
      {!session && (
        <div className="py-20 bg-gradient-to-r from-[#1E40AF] to-[#6366F1] relative overflow-hidden">
          {/* Abstract shapes for visual interest */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#0EA5E9] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#7C3AED] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-white">Ready to Accelerate Your Entrepreneurial Journey?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Join our community of founders, innovators, and business leaders who are shaping the future.
              </p>
              <AuthButton className="px-10 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl border border-[#9061F9]">
                Get Started Today
              </AuthButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}