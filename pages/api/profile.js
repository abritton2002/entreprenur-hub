// pages/api/profile.js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get auth token
  const token = await getToken({ req });
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // User ID from NextAuth token
  const userId = token.sub;
  
  // GET request - Fetch user profile
  if (req.method === "GET") {
    try {
      // First try to find an existing profile
      let userProfile = await prisma.userProfile.findFirst({
        where: { userId }
      });
      
      if (!userProfile) {
        return res.status(404).json({ notFound: true });
      }
      
      // Update last active timestamp
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { lastActive: new Date() }
      });
      
      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
  
  // POST request - Create or update user profile
  if (req.method === "POST") {
    const { 
      name, 
      bio, 
      skills, 
      businessNeeds, 
      industry, 
      startupStage, 
      location, 
      role, 
      lookingFor, 
      profileImage 
    } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    try {
      // Check if profile already exists
      const existingProfile = await prisma.userProfile.findFirst({
        where: { userId }
      });
      
      let userProfile;
      
      if (existingProfile) {
        // Update existing profile
        userProfile = await prisma.userProfile.update({
          where: { id: existingProfile.id },
          data: {
            name,
            bio,
            skills,
            businessNeeds,
            industry,
            startupStage,
            location,
            role,
            lookingFor,
            profileImage,
            lastActive: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        // Create new profile
        userProfile = await prisma.userProfile.create({
          data: {
            userId,
            name,
            bio,
            skills,
            businessNeeds,
            industry,
            startupStage,
            location,
            role,
            lookingFor,
            profileImage,
            lastActive: new Date()
          }
        });
      }
      
      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      return res.status(500).json({ error: "Failed to save profile" });
    }
  }
  
  // Unsupported method
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}