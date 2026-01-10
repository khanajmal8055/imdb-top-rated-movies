import { Router } from "express";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { isAdmin } from "../Middlewares/admin.middleware.js";
import { createMovies, deleteMovie, editMovieDetails, getAllMovies, loadIMDBMovies, searchMovies, sortedMovies } from "../Controllers/movie.controllers.js";
import { upload } from "../Middlewares/multer.middleware.js";


const router = Router()

router.route('/').get(getAllMovies)
router.route('/sorted').get(sortedMovies)
router.route('/search').get(searchMovies)

// Admin Protected Routes
router.route('/add-movies').post(verifyJwt,isAdmin , upload.single("poster") , createMovies)
router.route('/edit-movies/:movieId').put(verifyJwt,isAdmin,upload.single("poster") , editMovieDetails)
router.route('/delete-movies/:movieId').delete(verifyJwt,isAdmin,deleteMovie)
router.route('/load-movies').post(verifyJwt,isAdmin,loadIMDBMovies)

export default router 