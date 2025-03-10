// pages/api/messages/[partnerId].js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const userId = token.sub;
  const { partnerId } = req.query;
  
  // GET: Fetch conversation with specific user
  if (req.method === "GET") {
    try {
      // Get messages between the users
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, image: true }
          }
        }
      });
      
      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          senderId: partnerId,
          receiverId: userId,
          read: false
        },
        data: { read: true }
      });
      
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return res.status(500).json({ error: "Failed to fetch conversation" });
    }
  }
  
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}