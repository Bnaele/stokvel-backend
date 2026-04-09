import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// GET /api/contributions/my-contributions
export const getMyContributions = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).authenticatedUser;

    if (!authenticatedUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const contributions = await prisma.contributions.findMany({
      where: { user_id: authenticatedUser.user_id },
      include: {
        stokvel_groups: {
          select: {
            group_name: true
          }
        }
      },
      orderBy: {
        contribution_date: 'desc'
      }
    });

    const formattedContributions = contributions.map(c => ({
      id: c.contribution_id,
      amount: c.amount,
      date: c.contribution_date,
      status: c.status,
      groupName: c.stokvel_groups.group_name
    }));

    res.status(200).json({ contributions: formattedContributions });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
