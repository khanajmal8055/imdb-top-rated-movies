import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../Models/user.models.js";
import { Movie } from "../Models/movies.models.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { isValidObjectId } from "mongoose";
import {movieQueue} from "../queues/movie.queue.js";
import { movies } from "../utils/movieData.js";


const createMovies = asyncHandler(async(req,res)=>{
    const {title,description,rating , duration, releaseDate, imdbId} = req.body

    console.log(req.file);
    console.log(req.body);
    
    

    const posterLocalPath  = req.file?.path

    if(!posterLocalPath) {
        throw new ApiError(400 , "Poster is required for movie displaying")
    }

    if([title,description,rating,duration,releaseDate].some((field) => field?.trim()=== "")){
        throw new ApiError(400 , "All fields are Required")
    }

    const user =  await User.findById(req.user?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(400 , "You are not an authroized user to create a movie")


    }


    const poster = await uploadOnCloudinary(posterLocalPath)

    if(!poster){
        throw new ApiError(400 , "Something went wromg during upload on cloudinary")
    }

    const movieCreated = await Movie.create({
        title,
        description,
        rating,
        duration,
        releaseDate,
        poster : poster.url,
        imdbId : imdbId || "",
        createdBy : user
    })

    if(!movieCreated){
        throw new ApiError(400 , "There is some error in creating new movies")
    }

    return res.json(
        new ApiResponse(200 , createMovies , "Movies Created Successfully")
    )
})


const deleteMovie = asyncHandler(async(req,res)=>{

    const {movieId} = req.params

    if(!isValidObjectId(movieId)){
        throw new ApiError(400 , "Invalid Movie Id")
    }

    const movie = await Movie.findById(movieId);

    if(!movie){
        throw new ApiError(404 , "Movie Not found")
    }

    if(movie?.createdBy.toString() !== req.user?._id.toString()){
        throw new ApiError(402 , "You dont have access to delete the movie")
    }

    const movieDeleted = await Movie.findByIdAndDelete(movieId)

    if(!movieDeleted){
        throw new ApiError(403 , "Failed to delete the movie")
    }

    return res.json(
        new ApiResponse(200 , {}  , "Movie Deleted Successfully" )
    )
})


const editMovieDetails = asyncHandler(async(req,res)=>{

    const {movieId} = req.params

    if(!isValidObjectId(movieId)){
        throw new ApiError(400, "Invalid Movie Id")
    }

    const movie = await Movie.findById(movieId)

    if(!movie){
        throw new ApiError(400 , "Movie not found")
    }

    // if(movie?.createdBy.toString() !== req.user?._id.toString()){
    //     throw new ApiError(400 , "You are not Authorized to edit the movie details")
    // }

    const {title , description , rating } = req.body

    const posterLocalPath = req.file?.path

    if(!posterLocalPath){
        throw new ApiError(400 , "Poster is required")
    }

    const poster = await uploadOnCloudinary(posterLocalPath)

    if(!poster) {
        throw new ApiError(400 , "poster is not uploaded successfully")
    }

    if([title , description , rating ].some((field)=> field.trim() === "")){
        throw new ApiError(400 , "All fields are Required")
    }

    const updatedMovieDetails = await Movie.findByIdAndUpdate(
        movieId,
        {
            $set:{
                title,
                description,
                rating,
                poster:poster.url
            }
        }
    )

    if(!updatedMovieDetails){
        throw new ApiError(400 , "Failed to update movie details")
    }

    return res.json(
        new ApiResponse(200 , updatedMovieDetails , "Movie Details updated Successfully")
    )


})

const getAllMovies = asyncHandler(async(req,res)=>{

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page-1) * 10;

    const movies = await Movie.find().sort({rating:-1}).skip(skip).limit(limit)

    if(!movies){
        throw new ApiError(400 , "There is some issue to load the movies")
    }

    const total = await Movie.countDocuments()

    const fetchedMovies = {
        totalMovies : total,
        totalPages : Math.ceil(total/limit),
        currentPage : page,
        movies 

    }

    if(!fetchedMovies){
        throw new ApiError(404 , "Movies Not Found")
    }
    
    return res.json(
        new ApiResponse(200 , fetchedMovies , "Movies Fetched Successfully" )
    )
})

const searchMovies = asyncHandler(async(req,res)=>{

    const {search ,  page=1 , limit=10} = req.query

    // if(!search || search.trim()===""){
    //     throw new ApiError(404 , "Search query is required to search a movie")
    // }

    const skip = (page-1) * 10

    const filter = {
        $or : [
            {title : {$regex : search , $options : 'i'}},
            {description : {$regex : search , $options: 'i'}}
        ]
    }

    const movies = await Movie.find(filter).sort({rating : -1}).skip(skip).limit(Number(limit))
    console.log(movies);
    

    if(movies.length===0){
        throw new ApiError(404 , "No Movies found")
    }

    const total = await Movie.countDocuments(filter)

    const fetchedMovies = {
        total,
        currentPage : Number(page),
        totalPages : Math.ceil(total/limit),
        limit : Number(limit),
        movies
    }

    if(!fetchedMovies){
        throw new ApiError(400 , "Failed to fetched Movies")
    }

    return res.json(
        new ApiResponse(200 , fetchedMovies , "Movies fetched successfully")
    )

})

const sortedMovies = asyncHandler(async(req,res)=>{
    const {sortBy , order = "asc" , page=1 , limit=10} = req.query;

    const allowedFields = ['rating' , 'duration' , 'title' , 'releaseDate']

    if(!allowedFields.includes(sortBy)){
        throw new ApiError(400 , `Invalid Sort Field : ${sortBy}`)
    }

    const sortOrder = order === 'desc' ? -1 : 1
    const sortOption = {[sortBy]:sortOrder}

    const skip = (page - 1) * 10;

    const movies = await Movie.find().sort(sortOption).skip(skip).limit(Number(limit))

    if(!movies){
        throw new ApiError(400 , "No such Movies Found")
    }

    const total = await Movie.countDocuments()

    const fetchedMovies = {
        totalPages : Math.ceil(total/limit),
        page : Number(page),
        limit : Number(limit),
        sortBy,
        order,
        movies
    }

    if(!fetchedMovies){
        throw new ApiError(404, "failed to fetched movies")
    }

    return res.json(
        new ApiResponse(200 , fetchedMovies , "Movies Fetched Successfully")
    )
}) 

const singleMovie = asyncHandler(async(req,res)=>{
    const {movieId} = req.params;

    if(!isValidObjectId(movieId)){
        throw new ApiError(404 , "Invalid movie Id")
    }

    const movie = await Movie.findById(movieId)

    if(!movie){
        throw new ApiError(404 , "No movie found")
    }

    return res.json(
        new ApiResponse(200 , movie , "Movie fetched using its id")
    )
})

const loadIMDBMovies = asyncHandler(async(req,res)=>{


    console.log(movies.length);
    
    await movieQueue.addBulk(
        movies.map(movie=>({
            name:'insert-movie',
            data:movie,
            opts:{
                attempts: 3,
                backoff: {
                type: "exponential",
                delay: 3000
                }
            }
        }))
    )

    return res.json(
        new ApiResponse(200 , movies.length , "Movie Added Successfully")
    )

    


})

export {createMovies , deleteMovie , editMovieDetails , getAllMovies , searchMovies , sortedMovies , loadIMDBMovies,singleMovie}