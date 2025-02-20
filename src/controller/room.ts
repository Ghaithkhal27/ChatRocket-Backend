import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createRoom = async (req: Request, res: Response) => {
  const { name } = req.body;
  const { id } = req.params;
  try {
    const newRoom = await prisma.room.create({
      data: {
        id,
        name,
        users: {
          connect: { id },
        },
      },
      include: {
        users: true,
      },
    });
    res.status(201).json({ message: 'Room created', room: newRoom });
  } catch (error) {
    res.status(400).json({ error: 'Error creating room' });
  }
}


