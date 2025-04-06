import { Upload } from "lucide-react";
import mongoose, { now, Schema, schema } from "mongoose";
import { useDeprecatedAnimatedState } from "motion/react";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
{
 timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema); 