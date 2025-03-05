// In pages/api/posts.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          author: true,
          createdAt: true
        }
      });
      res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json([]);
    }
  } else if (req.method === "POST") {
    const { title, content, author } = req.body;
    
    // Validate the request
    if (!title || !content || !author) {
      return res.status(400).json({ error: "Title, content, and author are required" });
    }
    
    try {
      // Explicitly create only with fields we know exist
      const newPost = await prisma.post.create({
        data: {
          title: title,
          content: content,
          author: author
          // No likes field here
        },
        select: {
          id: true,
          title: true,
          content: true,
          author: true,
          createdAt: true
        }
      });
      
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create discussion" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}