import request from 'supertest';
import app from '../index';
import prisma from '../lib/prisma';

describe('US-1.2 Create a Stokvel Group', () => {

  // UAT 1: Admin can create a group
  it('should create a group when signed in as a valid user', async () => {
    const response = await request(app)
      .post('/api/groups')
      .set('x-auth-id', 'auth0|user001')
      .send({
        group_name: 'UAT Test Stokvel',
        contribution_amount: 200,
        payout_frequency: 'MONTHLY',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Stokvel group created successfully.');
    expect(response.body.group).toHaveProperty('group_id');
    expect(response.body.group.group_name).toBe('UAT Test Stokvel');
  });

  // UAT 2: Unauthenticated user cannot create a group
  it('should deny access when no auth ID is provided', async () => {
    const response = await request(app)
      .post('/api/groups')
      .send({
        group_name: 'Unauthorised Stokvel',
        contribution_amount: 200,
        payout_frequency: 'MONTHLY',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorised. No auth ID provided.');
  });

  // UAT 3: Invalid user cannot create a group
  it('should deny access when auth ID does not match any user', async () => {
    const response = await request(app)
      .post('/api/groups')
      .set('x-auth-id', 'invalid|user999')
      .send({
        group_name: 'Ghost Stokvel',
        contribution_amount: 200,
        payout_frequency: 'MONTHLY',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorised. User not found.');
  });

  // UAT 4: Missing fields return validation error
  it('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/groups')
      .set('x-auth-id', 'auth0|user001')
      .send({
        group_name: 'Incomplete Stokvel',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  // UAT 5: Invalid payout frequency is rejected
  it('should return 400 when payout_frequency is invalid', async () => {
    const response = await request(app)
      .post('/api/groups')
      .set('x-auth-id', 'auth0|user001')
      .send({
        group_name: 'Bad Frequency Stokvel',
        contribution_amount: 200,
        payout_frequency: 'DAILY',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('payout_frequency');
  });

  // UAT 6: User can view their groups
  it('should return groups for an authenticated user', async () => {
    const response = await request(app)
      .get('/api/groups')
      .set('x-auth-id', 'auth0|user001');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('groups');
    expect(Array.isArray(response.body.groups)).toBe(true);
  });

});
afterAll(async () => {
  await prisma.$disconnect();
});
