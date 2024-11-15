import dotenv from 'dotenv';
dotenv.config();

export const config = {
    apiKey: process.env.TMDB_API_KEY,
    baseUrl: 'https://api.themoviedb.org/3',
    port: process.env.PORT || 3000
};