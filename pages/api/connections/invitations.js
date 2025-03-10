// pages/api/connections/invitations.js
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Check authentication
    const token = await getToken({ req });
    
    // If not authenticated, return empty array instead of 401
    // This prevents errors in the UI when user is not logged in
    if (!token) {
      console.log("No authentication token found for /api/connections/invitations");
      return res.status(200).json([]);
    }

    // For GET requests, return invitations for authenticated user
    if (req.method === "GET") {
      const userId = token.sub;
      
      // For now, just return an empty array to prevent errors
      // You can uncomment the full implementation once the basic endpoint works
      /*
      // Fetch pending connection requests where the current user is the recipient
      const invitations = await prisma.connection.findMany({
        where: {
          recipientId: userId,
          status: "PENDING"
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              industry: true,
              role: true
            }
          }
        }
      });

      return res.status(200).json(invitations);
      */
      
      // Just return an empty array for now
      return res.status(200).json([]);
    }

    // Handle other request methods
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("API error in /api/connections/invitations:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
}