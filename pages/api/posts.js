import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany();
      res.status(200).json(Array.isArray(posts) ? posts : []); // ✅ Ensure response is an array
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json([]);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
