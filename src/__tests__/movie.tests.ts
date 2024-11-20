import request from 'supertest';
import express from 'express';
import { config } from '../config';
import axios from 'axios';
import { mocked } from 'jest-mock';

// Import the app code
import { app } from '../app'; // Assuming `app` is exported from your main file

jest.mock('axios');
const mockedAxios = mocked(axios);

describe('GET /api/movies/:year', () => {
    const baseUrl = config.baseUrl;
    const apiKey = config.apiKey;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 400 if year is invalid', async () => {
        const response = await request(app).get('/api/movies/invalidYear');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            success: false,
            message: `Invalid year. Please provide a year between 1900 and ${new Date().getFullYear()}`,
        });
    });

    test('returns 400 if year is out of range', async () => {
        const response = await request(app).get('/api/movies/1800');
        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/Invalid year/);
    });

    test('fetches movies successfully', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: '1',
                        title: 'Movie 1',
                        release_date: '2024-01-01',
                        vote_average: 8.5,
                    },
                ],
            },
        });

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                crew: [
                    { name: 'Editor 1', known_for_department: 'Editing' },
                ],
            },
        });

        const response = await request(app).get('/api/movies/2024');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: {
                year: '2024',
                movies: [
                    {
                        title: 'Movie 1',
                        release_date: '2024-01-01',
                        vote_average: 8.5,
                        editors: ['Editor 1'],
                    },
                ],
            },
        });
    });

    test('returns 500 on API failure', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('TMDB API error'));

        const response = await request(app).get('/api/movies/2024');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            message: 'Error fetching movies from TMDB',
        });
    });
});
