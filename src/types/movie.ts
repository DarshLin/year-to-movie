export interface Movie {
    id: string;
    title: string;
    release_date: string;
    vote_average: number;
    editors?: string[];
}

export interface Crew{
    name: string;
    known_for_department: string;
}

export interface MovieResponse {
    results: Movie[];
}