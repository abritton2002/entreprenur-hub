import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

// Enum for discussion types to ensure type safety
const DISCUSSION_TYPES = [
  'PIVOT_STRATEGY',
  'MVP_FEEDBACK', 
  'RESOURCE_SHARING', 
  'FUNDING_INSIGHTS', 
  'GENERAL'
];

// Industries list
const INDUSTRIES = [
  'Technology', 
  'SaaS', 
  'E-commerce', 
  'FinTech', 
  'Healthcare', 
  'EdTech', 
  'AI/ML', 
  'Blockchain', 
  'Sustainability', 
  'Other'
];

export default async function handler(req, res) {
  // Authentication for POST method
  const token = req.method === "POST" ? await getToken({ req }) : null;
  if (req.method === "POST" && !token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          author: true,
          createdAt: true,
          discussionType: true,
          validationScore: true,
          potentialImpact: true,
          complexityLevel: true,
          collaborationPotential: true,
          tags: true,
          industry: true,
          likes: true,
          _count: {
            select: { comments: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Transform the result to include comment count
      const transformedPosts = posts.map(post => ({
        ...post,
        commentCount: post._count.comments,
        // Remove the internal _count property
        _count: undefined
      }));

      res.status(200).json(transformedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json([]);
    }
  } else if (req.method === "POST") {
    const { 
      title, 
      content, 
      discussionType = 'GENERAL',
      tags,
      industry,
      potentialImpact = 0
    } = req.body;
    
    // Validate the request
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Validate discussion type
    if (discussionType && !DISCUSSION_TYPES.includes(discussionType)) {
      return res.status(400).json({ error: "Invalid discussion type" });
    }

    // Validate industry
    if (industry && !INDUSTRIES.includes(industry)) {
      return res.status(400).json({ error: "Invalid industry" });
    }
    
    try {
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          author: token.name, // Use authenticated user's name
          discussionType,
          tags: tags ? tags.join(',') : null, // Convert tags array to comma-separated string
          industry,
          potentialImpact: Math.min(5, Math.max(0, potentialImpact)) // Ensure 0-5 range
        },
        select: {
          id: true,
          title: true,
          content: true,
          author: true,
          createdAt: true,
          discussionType: true,
          potentialImpact: true,
          tags: true,
          industry: true
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