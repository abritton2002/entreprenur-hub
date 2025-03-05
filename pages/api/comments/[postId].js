import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { postId } = req.query;

  if (req.method === "GET") {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
      });

      res.status(200).json(Array.isArray(comments) ? comments : []); 
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal Server Error" }); 
    }
  } else if (req.method === "POST") {
    // Authenticate the user
    const token = await getToken({ req });
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    try {
      const newComment = await prisma.comment.create({
        data: { 
          content, 
          author: token.name, 
          postId 
        },
      });

      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}