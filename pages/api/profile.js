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
      // First try to find an existing user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({ notFound: true });
      }
      
      // Update last active timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      });
      
      return res.status(200).json(user);
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
    
    // Ensure email is present from token
    if (!token.email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      let updatedUser;
      
      if (existingUser) {
        // Update existing user
        updatedUser = await prisma.user.update({
          where: { id: userId },
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
            image: profileImage,
            lastActive: new Date()
          }
        });
      } else {
        // Create new user (unlikely with NextAuth, but kept for consistency)
        updatedUser = await prisma.user.create({
          data: {
            id: userId,
            email: token.email,
            name,
            bio,
            skills,
            businessNeeds,
            industry,
            startupStage,
            location,
            role,
            lookingFor,
            image: profileImage,
            lastActive: new Date()
          }
        });
      }
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error saving profile:", error);
      return res.status(500).json({ error: "Failed to save profile" });
    }
  }
  
  // Unsupported method
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}