// pages/api/connections/invite.js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // This endpoint only handles POST requests for sending invites
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate request
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const { toUserId, message } = req.body;
    const senderId = token.sub;

    if (!toUserId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }

    // Prevent self-connections
    if (toUserId === senderId) {
      return res.status(400).json({ error: "Cannot connect with yourself" });
    }

    // Check if the recipient exists
    const recipientExists = await prisma.user.findUnique({
      where: { id: toUserId }
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
            recipientId: toUserId
          },
          {
            senderId: toUserId,
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
        recipientId: toUserId,
        status: "PENDING",
        message: message || null
      },
      include: {
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
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
      recipient: newConnection.recipient
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return res.status(500).json({ error: "Failed to create invitation" });
  }
}