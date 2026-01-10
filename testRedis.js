import "dotenv/config"
// import  redis  from "./src/config/redis.js";

import { client } from "./src/config/redis.js";



// (async()=>{
//     await redis.set("test" , "redis working")
//     const value = await redis.get("test")
//     console.log(value);
//     process.exit(0);
    
// })();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result) 



// const scrappedData = JSON.stringify(movies)
// console.log(scrappedData);


// import { movies } from "./src/utils/movieData.js";


