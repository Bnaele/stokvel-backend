import { Request, Response } from 'express';
import prisma from '../lib/prisma';




    export const createGroup = async (req: Request, res: Response) => {
  try {
    const { group_name, contribution_amount, payout_frequency } = req.body;
    const authenticatedUser = (req as any).authenticatedUser;

    if (!group_name || !contribution_amount || !payout_frequency) {
      res.status(400).json({ error: 'group_name, contribution_amount and payout_frequency are required.' });
      return;
    }

    const validFrequencies = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];
    if (!validFrequencies.includes(payout_frequency.toUpperCase())) {
      res.status(400).json({ error: `payout_frequency must be one of: ${validFrequencies.join(', ')}` });
      return;
    }

    const group = await prisma.stokvel_groups.create({
      data: {
        group_name,
        contribution_amount,
        payout_frequency: payout_frequency.toUpperCase(),
        created_by: authenticatedUser.user_id,
      },
    });

    // Get or create Admin role
    let adminRole = await prisma.roles.findFirst({
      where: { role_name: 'Admin' },
    });

    if (!adminRole) {
      // Create Admin role if it doesn't exist
      adminRole = await prisma.roles.create({
        data: { role_name: 'Admin' },
      });
    }

    // Add creator as Admin member of the group
    await prisma.group_members.upsert({
      where: {
        user_id_group_id: {
          user_id: authenticatedUser.user_id,
          group_id: group.group_id,
        },
      },
      update: { role_id: adminRole.role_id },
      create: {
        user_id: authenticatedUser.user_id,
        group_id: group.group_id,
        role_id: adminRole.role_id,
      },
    });

    res.status(201).json({
      message: 'Stokvel group created successfully.',
      group,
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

    

export const getGroups = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = (req as any).authenticatedUser;

    const groups = await prisma.stokvel_groups.findMany({
      where: {
        group_members: {
          some: {
            user_id: authenticatedUser.user_id,
          },
        },
      },
      include: {
        users: {
          select: {
            first_name: true,
            surname: true,
            email: true,
          },
        },
        _count: {
          select: { group_members: true },
        },
      },
    });

    res.status(200).json({ groups });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authenticatedUser = (req as any).authenticatedUser;

    const group = await prisma.stokvel_groups.findUnique({
      where: { group_id: Number(id) },
      include: {
        users: {
          select: {
            first_name: true,
            surname: true,
            email: true,
          },
        },
        group_members: {
          include: {
            users: {
              select: {
                first_name: true,
                surname: true,
                email: true,
              },
            },
            roles: true,
          },
        },
      },
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found.' });
      return;
    }

    const isMember = group.group_members.some(
      (m) => m.user_id === authenticatedUser.user_id
    );

    if (!isMember) {
      res.status(403).json({ error: 'Forbidden. You are not a member of this group.' });
      return;
    }

    res.status(200).json({ group });

  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
