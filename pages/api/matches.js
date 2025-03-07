// pages/api/matches.js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

// Number of days to consider a user inactive
const INACTIVE_THRESHOLD_DAYS = 30;

export default async function handler(req, res) {
  try {
    // Get auth token
    const token = await getToken({ req });
    
    // If not authenticated, return empty array instead of 401
    if (!token) {
      console.log("No authentication token found for /api/matches");
      return res.status(200).json([]);
    }
    
    // Get current user profile
    const userId = token.sub;

    // Check for a complete user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        industry: true,
        skills: true,
        businessNeeds: true,
        startupStage: true,
        location: true,
        role: true,
        lookingFor: true
      }
    });
    
    // Check if profile is complete enough for matching
    if (!user || !isProfileComplete(user)) {
      return res.status(200).json({ 
        error: "Profile Incomplete", 
        message: "Please complete your profile before looking for matches"
      });
    }
    
    // GET request - Get matches for current user
    if (req.method === "GET") {
      // Get current date for calculating active users
      const activeDate = new Date();
      activeDate.setDate(activeDate.getDate() - INACTIVE_THRESHOLD_DAYS);
      
      // Find all other active users with complete profiles
      const allUsers = await prisma.user.findMany({
        where: {
          id: { not: userId },
          // Ensure other users have complete profiles too
          NOT: {
            OR: [
              { industry: null },
              { industry: '' },
              { role: null },
              { role: '' }
            ]
          }
        }
      });
      
      if (allUsers.length === 0) {
        // If no matching users found, return empty array
        return res.status(200).json([]);
      }
      
      // Calculate match scores
      const scoredMatches = calculateMatches(user, allUsers);
      
      // Get top matches (limited to 10)
      const topMatches = scoredMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      try {
        // Store match records in database
        for (const match of topMatches) {
          await prisma.match.upsert({
            where: {
              userId_matchedUserId: {
                userId: userId,
                matchedUserId: match.profile.id
              }
            },
            update: {
              matchScore: match.score,
              matchReason: JSON.stringify(match.reasons),
              status: 'PENDING'
            },
            create: {
              userId: userId,
              matchedUserId: match.profile.id,
              matchScore: match.score,
              matchReason: JSON.stringify(match.reasons),
              status: 'PENDING'
            }
          });
        }
      } catch (dbError) {
        console.error("Error storing matches in database:", dbError);
        // Continue even if DB storage fails - return the matches anyway
      }
      
      return res.status(200).json(topMatches);
    }
    
    // Unsupported method
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error generating matches:", error);
    // Return empty array to prevent UI errors
    return res.status(200).json([]);
  }
}

/**
 * Check if a user profile is complete enough for matching
 */
function isProfileComplete(user) {
  // Define minimum required fields for a complete profile
  const requiredFields = [
    'industry',
    'role',
    'lookingFor'
  ];

  // Check if all required fields have a non-empty value
  return requiredFields.every(field => 
    user[field] && user[field].trim() !== ''
  );
}

/**
 * Calculate match scores between a user and potential matches
 * @param {Object} user - The user's profile
 * @param {Array} potentialMatches - Array of potential match profiles
 * @returns {Array} Scored matches with reasons
 */
function calculateMatches(user, potentialMatches) {
  return potentialMatches.map(profile => {
    const scoreData = calculateMatchScore(user, profile);
    return {
      profile: {
        id: profile.id,
        name: profile.name,
        role: profile.role,
        industry: profile.industry,
        location: profile.location,
        lookingFor: profile.lookingFor
      },
      score: scoreData.score,
      reasons: scoreData.reasons
    };
  });
}

/**
 * Calculate individual match score between two users
 * @param {Object} user - The user's profile
 * @param {Object} potentialMatch - Potential match profile
 * @returns {Object} Score and reasons for the match
 */
function calculateMatchScore(user, potentialMatch) {
  let score = 0;
  const reasons = [];
  
  // Industry match (highest weight)
  if (user.industry && potentialMatch.industry && user.industry === potentialMatch.industry) {
    score += 30;
    reasons.push(`Both in the ${user.industry} industry`);
  }
  
  // Complementary roles (e.g., technical founder + business founder)
  if (isComplementaryRole(user.role, potentialMatch.role)) {
    score += 25;
    reasons.push(`Complementary roles: ${user.role} + ${potentialMatch.role}`);
  }
  
  // Looking for what the other offers
  if (matchesNeedToOffering(user.lookingFor, potentialMatch.role)) {
    score += 20;
    reasons.push(`You're looking for ${user.lookingFor} and they are a ${potentialMatch.role}`);
  }
  
  // Same startup stage
  if (user.startupStage && potentialMatch.startupStage && user.startupStage === potentialMatch.startupStage) {
    score += 15;
    reasons.push(`Both at ${user.startupStage} stage`);
  }
  
  // Skill overlap (based on comma-separated skills)
  const skillOverlap = getOverlap(user.skills, potentialMatch.skills);
  if (skillOverlap.length > 0) {
    score += 10;
    reasons.push(`Shared skills: ${skillOverlap.join(', ')}`);
  }
  
  // Business needs matching
  const needsOverlap = getOverlap(user.businessNeeds, potentialMatch.skills);
  if (needsOverlap.length > 0) {
    score += 20;
    reasons.push(`Your needs match their skills: ${needsOverlap.join(', ')}`);
  }
  
  // Location match (if both have location)
  if (user.location && potentialMatch.location && isSameCity(user.location, potentialMatch.location)) {
    score += 10;
    reasons.push(`Both located in ${potentialMatch.location}`);
  }
  
  return {
    score: Math.min(score, 99), // Cap the score
    reasons
  };
}

/**
 * Check if two roles are complementary
 */
function isComplementaryRole(role1, role2) {
  const complementaryPairs = [
    ['Technical Founder', 'Business Development'],
    ['Technical Founder', 'Marketing'],
    ['Technical Founder', 'Finance'],
    ['Product', 'Marketing'],
    ['Product', 'Design'],
    ['Business Development', 'Finance'],
    ['Investor', 'Technical Founder'],
    ['Investor', 'Business Development'],
    ['Mentor', 'Technical Founder'],
    ['Mentor', 'Business Development']
  ];
  
  return complementaryPairs.some(pair => 
    (pair[0] === role1 && pair[1] === role2) || 
    (pair[0] === role2 && pair[1] === role1)
  );
}

/**
 * Check if what user is looking for matches what potential match offers
 */
function matchesNeedToOffering(lookingFor, role) {
  const matches = {
    'Technical Co-Founder': ['Technical Founder'],
    'Business Co-Founder': ['Business Development', 'Marketing', 'Finance', 'Operations'],
    'Mentorship': ['Mentor'],
    'Investment': ['Investor'],
    'Team Members': ['Technical Founder', 'Business Development', 'Marketing', 'Design', 'Product', 'Operations'],
    'Advisors': ['Mentor', 'Investor']
  };
  
  return lookingFor && role && matches[lookingFor] && matches[lookingFor].includes(role);
}

/**
 * Find overlap between two comma-separated strings
 */
function getOverlap(str1, str2) {
  if (!str1 || !str2) return [];
  
  const arr1 = str1.split(',').map(item => item.trim().toLowerCase());
  const arr2 = str2.split(',').map(item => item.trim().toLowerCase());
  
  return arr1.filter(item => arr2.includes(item));
}

/**
 * Simple check if locations might be the same city
 */
function isSameCity(location1, location2) {
  if (!location1 || !location2) return false;
  
  const city1 = location1.split(',')[0].trim().toLowerCase();
  const city2 = location2.split(',')[0].trim().toLowerCase();
  
  return city1 === city2;
}