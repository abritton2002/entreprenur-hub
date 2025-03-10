// pages/api/messages/index.js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token) {
      console.log("No authentication token found");
      return res.status(200).json([]);
    }
    
    const userId = token.sub;

    // GET: Fetch messages (conversations list)
    if (req.method === "GET") {
      try {
        // Get all unique conversations involving the user
        const sentMessages = await prisma.message.findMany({
          where: { senderId: userId },
          select: { receiverId: true }
        });
        
        const receivedMessages = await prisma.message.findMany({
          where: { receiverId: userId },
          select: { senderId: true }
        });
        
        // Get unique user IDs that the current user has conversed with
        const uniqueUserIds = new Set();
        sentMessages.forEach(msg => uniqueUserIds.add(msg.receiverId));
        receivedMessages.forEach(msg => uniqueUserIds.add(msg.senderId));
        
        // For each conversation partner, get the most recent message
        const conversations = [];
        
        for (const partnerId of uniqueUserIds) {
          // Get the latest message between these users
          const latestMessage = await prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
              ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: { id: true, name: true, image: true }
              },
              receiver: {
                select: { id: true, name: true, image: true }
              }
            }
          });
          
          // Get unread count
          const unreadCount = await prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: userId,
              read: false
            }
          });
          
          // Get partner user details
          const partner = await prisma.user.findUnique({
            where: { id: partnerId },
            select: { 
              id: true,
              name: true, 
              image: true,
              industry: true,
              role: true
            }
          });
          
          if (partner && latestMessage) {
            conversations.push({
              partner,
              latestMessage,
              unreadCount
            });
          }
        }
        
        // Sort by most recent message
        conversations.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));
        
        return res.status(200).json(conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Failed to fetch conversations" });
      }
    }
    
    // POST: Send a new message
    if (req.method === "POST") {
      const { receiverId, content } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).json({ error: "Recipient and message content are required" });
      }
      
      try {
        // Verify that users are connected
        const areConnected = await prisma.connection.findFirst({
          where: {
            status: "ACCEPTED",
            OR: [
              { senderId: userId, recipientId: receiverId },
              { senderId: receiverId, recipientId: userId }
            ]
          }
        });
        
        if (!areConnected) {
          return res.status(403).json({ error: "You can only message users you're connected with" });
        }
        
        const message = await prisma.message.create({
          data: {
            content,
            senderId: userId,
            receiverId
          },
          include: {
            sender: {
              select: { id: true, name: true, image: true }
            }
          }
        });
        
        return res.status(201).json(message);
      } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Failed to send message" });
      }
    }
    
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error in messages API:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}