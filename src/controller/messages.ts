import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMessagesBySender = async (req: Request, res: Response) => {
  const { senderId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { senderId },
      include: {
        receiver: true,
        room: true,
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};



export const getMessages = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
        
          {
            senderId,
            receiverId,
          },
         
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
      include: {
        sender: true,
        receiver: true,
        room: true,
      },
      orderBy: {
        createdAt: 'asc', 
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};


