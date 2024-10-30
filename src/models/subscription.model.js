import mongoose , {Schema , model} from "mongoose"


const subscriptionSChema = new Schema({
        subscriber : {
            type : Schema.Types.ObjectId,  //one who is subscribed
            ref : "User"
        } , 
        
        channel : {
            type : Schema.Types.ObjectId, //all channels on snaxtube
            ref : "User"
        }
} , {timestamps : true})

export const Subscription = model("Subscription" , subscriptionSChema)
