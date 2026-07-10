import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { z } from 'zod';

const createProjectSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(1),
  status: z.string().min(1),
  managerId: z.string().min(1),
  pmId: z.string().min(1),
});

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: true,
        pm: true,
        tasks: true
      }
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

    const maxOrder = await prisma.project.aggregate({ _max: { orderIndex: true } });
    const orderIndex = (maxOrder._max.orderIndex || 0) + 1;

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        orderIndex
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const project = await prisma.project.update({
      where: { id: projectId },
      data: req.body
    });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
