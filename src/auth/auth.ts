import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret_key';

export const signup = async (req: Request, res: Response) => {
  const { username, email, password,profilePicture } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profilePicture,
      },
    });
    const token = jwt.sign({ userId: newUser.id, userName: newUser.username }, JWT_SECRET_KEY);
    res.status(201).json({ message: 'User created', user: newUser, token });
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id, userName: user.username }, JWT_SECRET_KEY);
    res.status(200).json({ message: 'Login successful', token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
