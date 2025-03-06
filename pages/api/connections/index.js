import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Authenticate request
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // GET: Retrieve all connections for the current user
  if (req.method === "GET") {
    try {
      // Get the user's ID from the JWT token
      const userId = token.sub;
      
      // Fetch connections where the user is either the sender or recipient
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              industry: true,
              role: true,
              location: true
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              industry: true,
              role: true,
              location: true
            }
          }
        }
      });

      // Transform the result for easier frontend consumption
      const formattedConnections = connections.map(connection => {
        // Determine if current user is the sender
        const isSender = connection.senderId === userId;
        
        // Get the other user in the connection
        const otherUser = isSender ? connection.recipient : connection.sender;
        
        return {
          id: connection.id,
          status: connection.status,
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
          message: connection.message,
          notes: connection.notes,
          user: otherUser,
          isOutgoing: isSender,
          isAccepted: connection.status === 'ACCEPTED'
        };
      });

      return res.status(200).json(formattedConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      return res.status(500).json({ error: "Failed to fetch connections" });
    }
  }

  // POST: Create a new connection request
  if (req.method === "POST") {
    try {
      const { recipientId, message } = req.body;
      const senderId = token.sub;

      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }

      // Prevent self-connections
      if (recipientId === senderId) {
        return res.status(400).json({ error: "Cannot connect with yourself" });
      }

      // Check if the recipient exists
      const recipientExists = await prisma.user.findUnique({
        where: { id: recipientId }
      });

      if (!recipientExists) {
        return res.status(404).json({ error: "Recipient not found" });
      }

      // Check if a connection already exists between these users
      const existingConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            {
              senderId: senderId,
              recipientId: recipientId
            },
            {
              senderId: recipientId,
              recipientId: senderId
            }
          ]
        }
      });

      if (existingConnection) {
        return res.status(400).json({ 
          error: "Connection already exists", 
          status: existingConnection.status 
        });
      }

      // Create new connection request
      const newConnection = await prisma.connection.create({
        data: {
          senderId,
          recipientId,
          status: "PENDING",
          message
        },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              industry: true,
              role: true
            }
          }
        }
      });

      // Update user's lastActive timestamp
      await prisma.user.update({
        where: { id: senderId },
        data: { lastActive: new Date() }
      });

      return res.status(201).json({
        id: newConnection.id,
        status: newConnection.status,
        createdAt: newConnection.createdAt,
        message: newConnection.message,
        user: newConnection.recipient,
        isOutgoing: true
      });
    } catch (error) {
      console.error("Error creating connection:", error);
      return res.status(500).json({ error: "Failed to create connection request" });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}