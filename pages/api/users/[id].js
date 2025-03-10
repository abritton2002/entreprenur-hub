// pages/api/users/[id].js
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const { id } = req.query;
  
  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
          industry: true,
          role: true,
          bio: true,
          location: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Failed to fetch user details" });
    }
  }
  
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}