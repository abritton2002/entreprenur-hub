import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: "desc" }
      });
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  } else if (req.method === "POST") {
    try {
      const {
        title,
        description,
        eventType,
        industry,
        startDate,
        endDate,
        location,
        address,
        isVirtual,
        meetingLink
      } = req.body;

      // Validate required fields
      if (!title || !description || !eventType || !industry || !startDate || !endDate || !location) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          eventType,
          industry,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          location,
          address,
          isVirtual: isVirtual || false,
          meetingLink
        }
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 