import mongoose, {Schema} from "mongoose";
import { video } from "motion/react-client";

const likesSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId
        ref: " Comments"
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweets: {
        type: Schema.Types.ObjectId,
        ref: "Tweets"
    }
},{
    timestamps: true
})


export const Likes = mongoose.model("Tweets", likesSchema);