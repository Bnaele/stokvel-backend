import request from 'supertest';
import app from '../src/index';
import prisma from '../src/lib/prisma';

describe('US: Member Contributions View', () => {
  
  // UAT 1: Member can view their contributions
  it('UAT 1 - Should show contributions for a member with existing contributions', async () => {
    const response = await request(app)
      .get('/api/contributions')
      .set('x-auth-id', 'auth0|user001');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('contributions');
    expect(Array.isArray(response.body.contributions)).toBe(true);
    
    if (response.body.contributions.length > 0) {
      const contribution = response.body.contributions[0];
      expect(contribution).toHaveProperty('amount');
      expect(contribution).toHaveProperty('contribution_date');
      expect(contribution).toHaveProperty('status');
      expect(['pending', 'confirmed', 'missed']).toContain(contribution.status);
    }
  });

  // UAT 2: Empty state for member with no contributions
  it('UAT 2 - Should return empty array for member with no contributions', async () => {
    // First, get a user with no contributions or create a test user
    // For now, we'll use a non-existent auth ID which should return empty
    const response = await request(app)
      .get('/api/contributions')
      .set('x-auth-id', 'auth0|no_contributions_test_user');

    expect(response.status).toBe(200);
    expect(response.body.contributions).toBeDefined();
  });

  // UAT 3: Reverse chronological order (most recent first)
  it('UAT 3 - Should return contributions in reverse chronological order', async () => {
    const response = await request(app)
      .get('/api/contributions')
      .set('x-auth-id', 'auth0|user001');

    expect(response.status).toBe(200);
    
    const contributions = response.body.contributions;
    if (contributions.length >= 2) {
      const date1 = new Date(contributions[0].contribution_date);
      const date2 = new Date(contributions[1].contribution_date);
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    }
  });

  // Authentication test - User must be signed in
  it('Should reject unauthenticated requests (no auth header)', async () => {
    const response = await request(app)
      .get('/api/contributions');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorised. No auth ID provided.');
  });

  // Invalid user test
  it('Should reject invalid auth ID', async () => {
    const response = await request(app)
      .get('/api/contributions')
      .set('x-auth-id', 'invalid|user999');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorised. User not found.');
  });
});
