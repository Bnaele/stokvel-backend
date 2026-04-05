import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const externalAuthId = req.headers['x-auth-id'] as string;

    console.log('Auth ID received:', externalAuthId);

    if (!externalAuthId) {
      res.status(401).json({ error: 'Unauthorised. No auth ID provided.' });
      return;
    }

    let user;
    try {
      user = await prisma.users.findFirst({
        where: { external_auth_id: externalAuthId },
      });
      console.log('User found:', user);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      res.status(500).json({ error: 'Database query failed.' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Unauthorised. User not found.' });
      return;
    }

    (req as any).authenticatedUser = user;
    next();

  } catch (error) {
    console.error('Middleware error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const requireGroupRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedUser = (req as any).authenticatedUser;
      const group_id = Number(req.params.id || req.body?.group_id);

      if (!group_id) {
        next();
        return;
      }

      const membership = await prisma.group_members.findFirst({
        where: {
          user_id: authenticatedUser.user_id,
          group_id: group_id,
        },
        include: { roles: true },
      });

      if (!membership) {
        res.status(403).json({ error: 'Forbidden. You are not a member of this group.' });
        return;
      }

      if (membership.roles.role_name !== roleName) {
        res.status(403).json({ error: `Forbidden. Only ${roleName}s can do this.` });
        return;
      }

      next();

    } catch (error) {
      console.error('Group role error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
};
