import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

// IMPORTANT: Only enable this in development!
const isDevelopment = process.env.NODE_ENV === "development";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Log environment details for debugging
  console.log('Current environment:', process.env.NODE_ENV);
  console.log('Is development:', isDevelopment);

  // Check if we're in development mode
  if (!isDevelopment) {
    return res.status(403).json({ 
      error: "Seed endpoint is only available in development mode" 
    });
  }

  // Optional: Require authentication for seeding
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ 
      error: "Authentication required" 
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    // Clear existing data to prevent duplicates
    // Note: Order matters due to foreign key constraints
    await prisma.impactVote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.match.deleteMany();
    await prisma.user.deleteMany();

    console.log('Existing data cleared. Beginning seeding...');

    // Create fake users
    const users = [];
    
    const industries = ["Technology", "SaaS", "E-commerce", "FinTech", "Healthcare"];
    const roles = ["Technical Founder", "Business Development", "Marketing", "Product", "Design"];
    const lookingForOptions = ["Technical Co-Founder", "Business Co-Founder", "Mentorship", "Investment", "Team Members"];

    for (let i = 1; i <= 50; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
          image: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i}.jpg`,
          bio: `This is a test bio for Test User ${i}. I am an entrepreneur interested in building great products.`,
          skills: ["JavaScript", "Marketing", "Product Design", "UX Research"][Math.floor(Math.random() * 4)],
          businessNeeds: ["Funding", "Technical Co-founder", "Marketing Strategy", "Sales Growth"][Math.floor(Math.random() * 4)],
          industry: industries[Math.floor(Math.random() * industries.length)],
          startupStage: ["Idea Stage", "Pre-seed", "Seed", "Series A", "Growth"][Math.floor(Math.random() * 5)],
          location: ["San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Berlin, Germany"][Math.floor(Math.random() * 5)],
          role: roles[Math.floor(Math.random() * roles.length)],
          lookingFor: lookingForOptions[Math.floor(Math.random() * lookingForOptions.length)]
        }
      });

      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create discussions/posts
    const discussionTypes = ["GENERAL", "PIVOT_STRATEGY", "MVP_FEEDBACK", "RESOURCE_SHARING", "FUNDING_INSIGHTS"];
    const discussions = [];
    
    for (let i = 1; i <= 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const post = await prisma.post.create({
        data: {
          title: `Test Discussion ${i}: Building a Startup in ${["2024", "Today's Market", "Tech", "Healthcare", "Fintech"][Math.floor(Math.random() * 5)]}`,
          content: `This is test content for discussion ${i}. Looking for feedback on my startup idea. The market is growing and I think there's a real opportunity here. What do you all think?`,
          author: randomUser.name,
          authorId: randomUser.id,
          discussionType: discussionTypes[Math.floor(Math.random() * discussionTypes.length)],
          tags: ["startup", "funding", "mvp", "growth", "saas"].slice(0, Math.floor(Math.random() * 5) + 1).join(','),
          industry: industries[Math.floor(Math.random() * industries.length)],
          potentialImpact: Math.floor(Math.random() * 5) + 1,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
        }
      });
      discussions.push(post);
      
      // Add comments to each discussion
      const commentCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < commentCount; j++) {
        const commentUser = users[Math.floor(Math.random() * users.length)];
        await prisma.comment.create({
          data: {
            postId: post.id,
            content: `This is comment ${j+1} on discussion ${i}. I think ${["this is a great idea!", "you should consider pivoting.", "have you validated this with customers?", "I had a similar experience.", "let's connect to discuss further."][Math.floor(Math.random() * 5)]}`,
            author: commentUser.name,
            authorId: commentUser.id,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
          }
        });
      }
    }

    console.log(`Created ${discussions.length} discussions`);

    // Create some connections between users
    const connections = [];
    const connectionPairs = new Set();

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < 3; j++) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        if (randomUserIndex !== i) {
          // Create a unique key for the connection pair
          const connectionKey = [users[i].id, users[randomUserIndex].id].sort().join('_');
          
          // Only create the connection if it doesn't already exist
          if (!connectionPairs.has(connectionKey)) {
            try {
              const connection = await prisma.connection.create({
                data: {
                  senderId: users[i].id,
                  recipientId: users[randomUserIndex].id,
                  status: ["PENDING", "ACCEPTED", "DECLINED"][Math.floor(Math.random() * 3)],
                  message: `Hi, I'd like to connect with you. I think we could work together on ${["a new project", "sharing ideas", "potential partnership", "networking"][Math.floor(Math.random() * 4)]}.`
                }
              });
              connections.push(connection);
              connectionPairs.add(connectionKey);
            } catch (error) {
              // Log any individual connection creation errors
              console.error('Error creating connection:', error);
            }
          }
        }
      }
    }

    console.log(`Created ${connections.length} connections`);

    // Create some matches
    const matches = [];
    const matchPairs = new Set();

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < 2; j++) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        if (randomUserIndex !== i) {
          // Create a unique key for the match pair
          const matchKey = [users[i].id, users[randomUserIndex].id].sort().join('_');
          
          // Only create the match if it doesn't already exist
          if (!matchPairs.has(matchKey)) {
            try {
              const match = await prisma.match.create({
                data: {
                  userId: users[i].id,
                  matchedUserId: users[randomUserIndex].id,
                  matchScore: Math.random(),
                  matchReason: JSON.stringify(["Similar industry", "Complementary skills"]),
                  status: ["PENDING", "ACCEPTED", "DECLINED"][Math.floor(Math.random() * 3)]
                }
              });
              matches.push(match);
              matchPairs.add(matchKey);
            } catch (error) {
              // Log any individual match creation errors
              console.error('Error creating match:', error);
            }
          }
        }
      }
    }

    console.log(`Created ${matches.length} matches`);

    return res.status(200).json({ 
      message: "Database seeded successfully", 
      users: users.length,
      discussions: discussions.length,
      connections: connections.length,
      matches: matches.length
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return res.status(500).json({ 
      error: "Failed to seed database", 
      details: error.message 
    });
  }
}