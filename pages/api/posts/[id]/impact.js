import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Use getToken instead of getSession for more reliable authentication
  const token = await getToken({ req });
  
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { id } = req.query;

  if (req.method === "POST") {
    const { 
      voteValue,  // numeric value representing impact rating (0-5)
      currentValue // current value to determine vote type
    } = req.body;

    // Validate input
    if (voteValue === undefined || voteValue < 0 || voteValue > 5) {
      return res.status(400).json({ error: "Invalid vote value. Must be between 0 and 5." });
    }

    try {
      // Determine vote type based on current and new value
      const voteType = voteValue > (currentValue || 0) ? 'upvote' : 'downvote';

      // Upsert the vote - create if not exists, update if exists
      const upsertedVote = await prisma.impactVote.upsert({
        where: {
          postId_userId: {
            postId: id,
            userId: token.sub
          }
        },
        update: {
          voteValue: voteValue,
          voteType: voteType
        },
        create: {
          postId: id,
          userId: token.sub,
          voteValue: voteValue,
          voteType: voteType
        }
      });

      // Recalculate impact score
      const votes = await prisma.impactVote.findMany({
        where: { postId: id }
      });

      // Calculate average vote
      const totalVotes = votes.length;
      const averageVote = votes.reduce((sum, vote) => sum + vote.voteValue, 0) / totalVotes;
      
      // Update post with new impact score
      const updatedPost = await prisma.post.update({
        where: { id: id },
        data: {
          potentialImpact: Math.round(averageVote)
        }
      });

      res.status(200).json({
        message: "Vote recorded successfully",
        newImpactScore: updatedPost.potentialImpact,
        totalVotes: totalVotes
      });
    } catch (error) {
      console.error("Error processing vote:", error);
      res.status(500).json({ error: "Failed to process vote" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};