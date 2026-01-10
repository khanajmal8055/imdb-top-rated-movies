import { Queue } from "bullmq";
import {redisConnection} from "../config/redis.js";

export const movieQueue = new Queue("movie_queue" , {
    connection:redisConnection
})

