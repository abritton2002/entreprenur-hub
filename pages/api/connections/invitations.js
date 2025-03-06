import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Authenticate request
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = token.sub;

  if (req.method === "GET") {
    try {
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
    } catch (error) {
      console.error("Error fetching invitations:", error);
      return res.status(500).json({ error: "Failed to fetch invitations" });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}