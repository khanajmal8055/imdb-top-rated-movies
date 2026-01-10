import { Worker } from "bullmq";
import axios from "axios";
import {redisConnection} from "../config/redis.js";
import databaseConnection from "../DB/index.js";
import { movies } from "../utils/movieData.js";
import { Movie } from "../Models/movies.models.js";
import "dotenv/config"

await databaseConnection()

const worker = new Worker("movie_queue" , 
    async(job)=>{
        console.log(job.data.imdbID);
        
        await Movie.create({
            title:job.data.Title,
            description:job.data.Plot,
            poster:job.data.Poster,
            duration:job.data.Runtime,
            rating:job.data.imdbRating,
            releaseDate:job.data.Released,
            imdbId:job.data.imdbID,
    
        })
    },
    
    {connection:redisConnection}
)