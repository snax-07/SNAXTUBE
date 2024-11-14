import mongoose  , {Schema , model} from "mongoose"



const playlistSchema = Schema({
    name : {
        type : String, 
        required : true
    },

    description : {
        type : String, 
        required : true
    },

    video : [
        {
          type : Schema.Types.ObjectId,
          ref : "Video",
          required : true
        }
    ],

    owner : {
        type : Schema.Types.ObjectId,
          ref : "User",
    }
} ,{timestamps : true})

export const Playlist = model("Playlist" , playlistSchema)