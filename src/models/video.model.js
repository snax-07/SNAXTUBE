import mongoose , {Schema , model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile : {
        type : String ,//CLOUDNIRY URL FOR VIDEO ,
        required : true
    },
    thumbnail : {
        type : String ,
        required : true
    },
    title : {
        type : String ,//CLOUDNIRY URL FOR VIDEO ,
        required : true
    },
    description : {
        type : String ,//CLOUDNIRY URL FOR VIDEO ,
        required : true
    },
    duration : {
        type : Number ,//CLOUDNIRY URL FOR 
        required : true
    }, 
    views : {
        type : Number,
        default : 0
    }, 

    isPublished : {
        type : Boolean,
        default : true 
    },

    ownerShip : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
} , {timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = model("Video" , videoSchema)