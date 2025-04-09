import mongoose, {Schema} from "mongoose";

const likesSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: " Comments"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
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