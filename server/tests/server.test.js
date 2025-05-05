const request = require('supertest');
const express = require('express');

// Create a simple Express app for testing
const app = express();
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
});

describe('GET /', () => {
  it('responds with Hello World!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hello World!');
  });
});