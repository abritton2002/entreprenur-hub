import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from 'next/head';
import { motion } from 'framer-motion';
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
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Feature cards with updated colors
  const featureCards = [
    {
      title: "Discussions",
      description: "Connect with entrepreneurs and share insights",
      href: "/discussions",
      icon: <FaComments className="w-6 h-6" />,
      color: "#06B6D4" // Cyan for communication
    },
    {
      title: "Impact Voting",
      description: "Validate and rate entrepreneurial ideas",
      href: "/discussions",
      icon: <FaRocket className="w-6 h-6" />,
      color: "#8B5CF6" // Softer purple for innovation
    },
    {
      title: "Resource Sharing",
      description: "Discover tools and opportunities for growth",
      href: "/discussions",
      icon: <FaTools className="w-6 h-6" />,
      color: "#4F46E5" // Deeper indigo for creativity
    },
    {
      title: "Network",
      description: "Expand your entrepreneurial connections",
      href: "/connections",
      icon: <FaHandshake className="w-6 h-6" />,
      color: "#1E3A8A" // Darker blue for trust
    }
  ];

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Discussions", href: "/discussions" },
    { name: "Events", href: "/events" },
    { name: "Connections", href: "/connections" }
  ];

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-t-[#8B5CF6] border-gray-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>LYKMYND</title>
        <meta name="description" content="Join LYKMYND to connect, validate, and grow with fellow entrepreneurs." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link href="/">
                <div className="font-bold text-2xl text-[#1E3A8A] tracking-tight cursor-pointer">
                  LYKMYND
                </div>
              </Link>

              <nav className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <span className="text-gray-700 hover:text-[#06B6D4] font-medium cursor-pointer transition-colors duration-200">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="hidden md:block">
                {session ? (
                  <Link href="/profile">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="bg-[#1E3A8A] hover:bg-[#1E2A6A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      My Profile
                    </motion.button>
                  </Link>
                ) : (
                  <AuthButton className="bg-[#1E3A8A] hover:bg-[#1E2A6A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                    Sign In
                  </AuthButton>
                )}
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  className="text-gray-700 hover:text-[#06B6D4] transition-colors duration-200"
                >
                  {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-100">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link href={item.href} key={item.name}>
                      <span
                        className="text-gray-700 hover:text-[#06B6D4] font-medium block cursor-pointer transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                  {session ? (
                    <Link href="/profile">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#1E3A8A] hover:bg-[#1E2A6A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-left"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Profile
                      </motion.button>
                    </Link>
                  ) : (
                    <AuthButton
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-[#1E3A8A] hover:bg-[#1E2A6A] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-left"
                    >
                      Sign In
                    </AuthButton>
                  )}
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section with Tagline */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1E3A8A] to-[#4F46E5]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06B6D4] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-10 left-0 w-64 h-64 bg-[#8B5CF6] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>

          <div className="container mx-auto px-6 py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-6xl font-bold mb-2 text-white tracking-tight leading-tight">
                LYKMYND
              </h1>
              <p className="text-xl text-blue-200 mb-6 font-medium">Connect. Validate. Grow.</p>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                {session ? `Welcome back, ${session?.user?.name || 'Entrepreneur'}! Dive into our community.` : 
                  "An entrepreneurial community for sharing ideas, validating concepts, and growing together."}
              </p>

              {!session ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AuthButton className="px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-lg transition transform hover:shadow-xl inline-flex items-center">
                    Join the Community <FaArrowRight className="ml-2" />
                  </AuthButton>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/discussions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-lg transition transform hover:shadow-xl inline-flex items-center justify-center"
                    >
                      Browse Discussions <FaArrowRight className="ml-2" />
                    </motion.button>
                  </Link>
                  <Link href="/events">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-8 py-4 bg-white text-[#1E3A8A] font-semibold rounded-lg shadow-lg transition transform hover:shadow-xl inline-flex items-center justify-center"
                    >
                      Explore Events <FaArrowRight className="ml-2" />
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Animated Wave Separator */}
          <motion.svg
            className="fill-[#F8FAFC] w-full h-24 -mb-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <path d="M0,96L48,117.3C96,139,192,181,288,186.7C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </motion.svg>
        </div>

        {/* Feature Cards Section */}
        <div className="py-16 bg-[#F8FAFC]">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-[#1E3A8A]">How We Empower Entrepreneurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featureCards.map((card, index) => (
                <Link href={card.href} key={index}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="h-2 w-full" style={{ backgroundColor: card.color }}></div>
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${card.color}15` }}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            style={{ color: card.color }}
                          >
                            {card.icon}
                          </motion.div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-[#06B6D4] transition-colors duration-300">{card.title}</h3>
                          <p className="text-gray-600">{card.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-[#1E3A8A]">Why Entrepreneurs Choose LYKMYND</h2>
                  <div className="space-y-8">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#06B6D4] bg-opacity-10 text-[#06B6D4]">
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
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#4F46E5] bg-opacity-10 text-[#4F46E5]">
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
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#8B5CF6] bg-opacity-10 text-[#8B5CF6]">
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

                {/* Testimonial with Gradient Placeholder */}
                <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-lg shadow-lg p-8 border border-gray-100 relative">
                  <div className="absolute -top-3 -left-3">
                    <div className="text-[#8B5CF6] text-4xl">❝</div>
                  </div>
                  <div className="pt-4">
                    <p className="text-gray-700 italic mb-6 text-lg leading-loose">
                      "LYKMYND has been instrumental in helping me validate my business concept and find the right partnerships. The feedback I received shaped my product roadmap significantly, and the connections I've made continue to be invaluable."
                    </p>
                    <div className="flex items-center mt-8">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] rounded-full mr-4"></div>
                      <div>
                        <div className="font-semibold text-gray-800">Sarah Chen</div>
                        <div className="text-gray-500 text-sm">Founder, TechStart Solutions</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3">
                    <div className="text-[#8B5CF6] text-4xl">❞</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats (Hardcoded) */}
        {session && (
          <div className="py-16 bg-[#F8FAFC]">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-16 text-center text-[#1E3A8A]">Community Pulse</h2>
              <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 mx-auto bg-[#06B6D4] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FaUsers className="w-8 h-8 text-[#06B6D4]" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">120+</div>
                  <div className="text-gray-600">Active Members</div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 mx-auto bg-[#1E3A8A] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FaComments className="w-8 h-8 text-[#1E3A8A]" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">56</div>
                  <div className="text-gray-600">Discussions</div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 mx-auto bg-[#8B5CF6] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FaRocket className="w-8 h-8 text-[#8B5CF6]" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">32</div>
                  <div className="text-gray-600">Impact Votes</div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 mx-auto bg-[#4F46E5] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FaLaptopCode className="w-8 h-8 text-[#4F46E5]" />
                  </div>
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">18</div>
                  <div className="text-gray-600">Resources Shared</div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        {!session && (
          <div className="py-20 bg-gradient-to-r from-[#1E3A8A] to-[#4F46E5] relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#06B6D4] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#8B5CF6] rounded-full mix-blend-multiply opacity-20 blur-3xl"></div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6 text-white">Ready to Accelerate Your Entrepreneurial Journey?</h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join our community of founders, innovators, and business leaders who are shaping the future.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AuthButton className="px-10 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xl transition transform hover:shadow-2xl border border-[#A78BFA]">
                    Get Started Today
                  </AuthButton>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}