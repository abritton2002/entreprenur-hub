import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
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
        }
      });

      if (!post) {
        return res.status(404).json({ error: `Post with ID ${id} not found.` });
      }

      // Transform the result to include comment count
      const postWithCommentCount = {
        ...post,
        commentCount: post._count.comments,
        _count: undefined
      };

      res.status(200).json(postWithCommentCount);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}