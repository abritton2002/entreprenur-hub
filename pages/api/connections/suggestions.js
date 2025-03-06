import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Only support GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate request
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = token.sub;

  try {
    // Get the current user with their profile information
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        industry: true,
        skills: true,
        businessNeeds: true,
        startupStage: true,
        lookingFor: true
      }
    });
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all existing connections (in any status)
    const existingConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      select: {
        senderId: true,
        recipientId: true
      }
    });

    // Create a set of user IDs that are already connected
    const connectedUserIds = new Set(
      existingConnections.flatMap(conn => [conn.senderId, conn.recipientId])
    );
    
    // Remove the current user from this set
    connectedUserIds.delete(userId);

    // Get any algorithm-generated matches
    const algorithmMatches = await prisma.match.findMany({
      where: {
        userId: userId,
        status: "PENDING" // Only get pending matches
      },
      include: {
        matchedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            industry: true,
            skills: true,
            businessNeeds: true,
            role: true,
            location: true,
            startupStage: true,
            lookingFor: true
          }
        }
      }
    });

    // Create a set of user IDs from algorithm matches
    const matchedUserIds = new Set(
      algorithmMatches.map(match => match.matchedUserId)
    );

    // Find potential connections (users who are not already connected)
    const potentialConnections = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
          notIn: Array.from(connectedUserIds)
        },
        // Filter for users in same industry or with complementary skills
        OR: [
          // Same industry if current user has an industry
          currentUser.industry ? { industry: currentUser.industry } : {},
          
          // Match skills with business needs if available
          currentUser.businessNeeds ? {
            skills: {
              contains: currentUser.businessNeeds
            }
          } : {},
          
          // Match business needs with skills if available
          currentUser.skills ? {
            businessNeeds: {
              contains: currentUser.skills
            }
          } : {},
          
          // Match looking for with role if available
          currentUser.lookingFor ? {
            role: {
              contains: currentUser.lookingFor
            }
          } : {},
          
          // Match role with looking for if available
          currentUser.role ? {
            lookingFor: {
              contains: currentUser.role
            }
          } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        industry: true,
        skills: true,
        businessNeeds: true,
        role: true,
        location: true,
        startupStage: true,
        lookingFor: true,
        createdAt: true
      },
      take: 10, // Limit results
      orderBy: {
        lastActive: 'desc' // Prioritize recently active users
      }
    });

    // Format algorithm matches for frontend
    const formattedMatches = algorithmMatches.map(match => ({
      id: match.id,
      user: match.matchedUser,
      matchScore: match.matchScore,
      matchReason: JSON.parse(match.matchReason || '[]'),
      createdAt: match.createdAt
    }));

    // Create discovery suggestions (exclude users that are already algorithm matches)
    const discoverySuggestions = potentialConnections
      .filter(user => !matchedUserIds.has(user.id))
      .map(user => {
        // Calculate a very basic match score based on shared attributes
        let matchScore = 0;
        const matchReasons = [];
        
        // Check for industry match
        if (user.industry && currentUser.industry === user.industry) {
          matchScore += 0.3;
          matchReasons.push(`Same industry: ${user.industry}`);
        }
        
        // Check for complementary skills/needs
        if (user.skills && currentUser.businessNeeds) {
          const userSkills = user.skills.split(',').map(s => s.trim().toLowerCase());
          const currentUserNeeds = currentUser.businessNeeds.split(',').map(n => n.trim().toLowerCase());
          
          const matches = userSkills.filter(skill => 
            currentUserNeeds.some(need => need.includes(skill) || skill.includes(need))
          );
          
          if (matches.length > 0) {
            matchScore += 0.2 * Math.min(matches.length / 2, 1); // Cap at 0.2
            matchReasons.push(`Has skills you need: ${matches.join(', ')}`);
          }
        }
        
        // Check for complementary needs/skills
        if (user.businessNeeds && currentUser.skills) {
          const userNeeds = user.businessNeeds.split(',').map(n => n.trim().toLowerCase());
          const currentUserSkills = currentUser.skills.split(',').map(s => s.trim().toLowerCase());
          
          const matches = userNeeds.filter(need => 
            currentUserSkills.some(skill => need.includes(skill) || skill.includes(need))
          );
          
          if (matches.length > 0) {
            matchScore += 0.2 * Math.min(matches.length / 2, 1); // Cap at 0.2
            matchReasons.push(`Needs skills you have: ${matches.join(', ')}`);
          }
        }
        
        // Check for role/looking for match
        if (user.lookingFor && currentUser.role) {
          const userLookingFor = user.lookingFor.split(',').map(l => l.trim().toLowerCase());
          const currentUserRole = currentUser.role.toLowerCase();
          
          if (userLookingFor.some(l => l.includes(currentUserRole) || currentUserRole.includes(l))) {
            matchScore += 0.2;
            matchReasons.push(`Looking for someone with your role`);
          }
        }
        
        if (user.role && currentUser.lookingFor) {
          const userRole = user.role.toLowerCase();
          const currentUserLookingFor = currentUser.lookingFor.split(',').map(l => l.trim().toLowerCase());
          
          if (currentUserLookingFor.some(l => l.includes(userRole) || userRole.includes(l))) {
            matchScore += 0.2;
            matchReasons.push(`Has a role you're looking for`);
          }
        }
        
        // Add a small random factor to avoid identical scores
        matchScore += Math.random() * 0.1;
        matchScore = Math.min(matchScore, 0.99); // Cap at 0.99
        
        return {
          id: null, // Not a stored match
          user,
          matchScore: parseFloat(matchScore.toFixed(2)),
          matchReason: matchReasons,
          createdAt: user.createdAt
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
      .slice(0, 5); // Take top 5

    return res.status(200).json({
      algorithmMatches: formattedMatches,
      discoverySuggestions
    });
  } catch (error) {
    console.error("Error fetching connection suggestions:", error);
    return res.status(500).json({ error: "Failed to fetch suggestions" });
  }
}