import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getUserContributions = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).authenticatedUser;
    const { group_id } = req.query;

    const whereClause: any = {
      user_id: authenticatedUser.user_id,
    };

    if (group_id) {
      whereClause.group_id = Number(group_id);
    }

    const contributions = await prisma.contributions.findMany({
      where: whereClause,
      include: {
        stokvel_groups: {
          select: {
            group_name: true,
          },
        },
      },
      orderBy: {
        contribution_date: 'desc',
      },
    });

    res.status(200).json({
      contributions: contributions,
      count: contributions.length,
    });

  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
