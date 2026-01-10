import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
    rating : {
        type : Number,
        required : true,


    },
    duration : {
        type : String,
        required : true,

    },
    releaseDate : {
        type : Date,
        required : true,

    },
    imdbId : {
        type : String,
        unique : true,
        required : true
    },
    poster : {
        type : String,
        required : true,

    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
    
},
    {timestamps:true}
)


export const Movie = mongoose.model("Movie" , movieSchema)