import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { postId } = req.query;

  if (req.method === "GET") {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
      });

      res.status(200).json(Array.isArray(comments) ? comments : []); // ✅ Ensure array
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal Server Error" }); // ✅ Always return JSON
    }
  } else if (req.method === "POST") {
    const { content, author } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: "Content and author are required" });
    }

    try {
      const newComment = await prisma.comment.create({
        data: { content, author, postId },
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
