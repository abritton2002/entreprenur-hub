// pages/api/connections/invitations/[id].js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  
  // Authenticate user
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const userId = token.sub;

  try {
    // Check if invitation exists and if user is the recipient
    const invitation = await prisma.connection.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Verify user is the recipient of this invitation
    if (invitation.recipientId !== userId) {
      return res.status(403).json({ error: "Not authorized to access this invitation" });
    }

    // PUT: Update invitation status (accept/decline)
    if (req.method === "PUT") {
      const { status } = req.body;
      
      if (!status || !['ACCEPTED', 'DECLINED'].includes(status)) {
        return res.status(400).json({ error: "Valid status (ACCEPTED or DECLINED) is required" });
      }

      // Update the invitation status
      const updatedInvitation = await prisma.connection.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      // Update user's lastActive timestamp
      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      });

      return res.status(200).json({
        id: updatedInvitation.id,
        status: updatedInvitation.status,
        updatedAt: updatedInvitation.updatedAt
      });
    }

    // Method not allowed
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Error processing invitation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}