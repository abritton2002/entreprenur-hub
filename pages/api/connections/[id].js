import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Get connection ID from URL
  const { id } = req.query;
  
  // Authenticate user
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const userId = token.sub;

  try {
    // Check if connection exists and if user is part of it
    const connection = await prisma.connection.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true
          }
        }
      }
    });

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Verify user is part of this connection
    const isSender = connection.senderId === userId;
    const isRecipient = connection.recipientId === userId;

    if (!isSender && !isRecipient) {
      return res.status(403).json({ error: "Not authorized to access this connection" });
    }

    // GET: Retrieve connection details
    if (req.method === "GET") {
      const otherUser = isSender ? connection.recipient : connection.sender;
      
      return res.status(200).json({
        id: connection.id,
        status: connection.status,
        message: connection.message,
        notes: connection.notes,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        user: otherUser,
        isOutgoing: isSender
      });
    }

    // PATCH: Update connection status
    if (req.method === "PATCH") {
      const { action, notes } = req.body;
      
      if (!action) {
        return res.status(400).json({ error: "Action is required" });
      }

      let updatedStatus;
      let isAllowed = false;

      // Define permitted actions based on user role and current status
      switch (action) {
        case "accept":
          // Only recipient can accept a pending request
          isAllowed = isRecipient && connection.status === "PENDING";
          updatedStatus = "ACCEPTED";
          break;
          
        case "reject":
        case "decline":
          // Only recipient can reject a pending request
          isAllowed = isRecipient && connection.status === "PENDING";
          updatedStatus = "DECLINED";
          break;
          
        case "cancel":
          // Only sender can cancel a pending request
          isAllowed = isSender && connection.status === "PENDING";
          updatedStatus = "CANCELLED";
          break;
          
        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      if (!isAllowed) {
        return res.status(403).json({ 
          error: "Not authorized to perform this action on the connection" 
        });
      }

      // Update the connection
      const updatedConnection = await prisma.connection.update({
        where: { id },
        data: { 
          status: updatedStatus,
          ...(notes && { notes }),
          updatedAt: new Date()
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true
            }
          }
        }
      });

      // Update user's lastActive timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      });

      // Format the response
      const otherUser = isSender ? updatedConnection.recipient : updatedConnection.sender;

      return res.status(200).json({
        id: updatedConnection.id,
        status: updatedConnection.status,
        message: updatedConnection.message,
        notes: updatedConnection.notes,
        createdAt: updatedConnection.createdAt,
        updatedAt: updatedConnection.updatedAt,
        user: otherUser,
        isOutgoing: isSender
      });
    }

    // DELETE: Remove connection
    if (req.method === "DELETE") {
      // Both users can delete the connection
      await prisma.connection.delete({
        where: { id }
      });

      // Update user's lastActive timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      });

      return res.status(200).json({ 
        message: "Connection successfully removed" 
      });
    }

    // Method not allowed
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error processing connection request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}