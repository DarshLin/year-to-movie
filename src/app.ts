import express, { Request, Response, Router } from 'express';
import { config } from './config';
import { Crew, Movie, MovieResponse } from './types/movie'
import axios from 'axios'

const app = express();
const router = Router();
const port = process.env.PORT || 3000;;

app.use(express.json());

router.get('/movies/:year', async (req: Request, res: Response) => {
    try {
        const year = req.params.year;

        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year. Please provide a year between 1900 and ' + new Date().getFullYear()
            });
        }
        const response = await axios.get<MovieResponse>(`${config.baseUrl}/discover/movie`, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            params: {
                primary_release_year: year,
                sort_by: 'popularity.desc',
                include_adult: false,
                language: 'en-US'
            }
        });

        let movies = response.data.results.map((movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            editors: [] as string[]
        }));

        for (const movie of movies) {
            movie.editors = await getEditors(movie.id);
        }

        res.json({
            success: true,
            data: {
                year,
                movies: movies.map(({id, ...movie}) => movie)
            }
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching movies from TMDB'
        });
    }
});

async function getEditors(movieId: string): Promise<string[]> {
    const response = await axios.get(`${config.baseUrl}/movie/${movieId}/credits`, {
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        },
        params: {
            language: 'en-US'
        }
    });
    const editors = response.data.crew.filter((crewMember: Crew) => crewMember.known_for_department === 'Editing').map((editor: Crew) => editor.name);
    return editors;
}


app.use('/api', router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})


