import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription for a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the user is trying to subscribe to their own channel
    if (req.user.id === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // Check if the user has already subscribed
    const existingSubscription = await Subscription.findOne({
        channelId,
        subscriberId: req.user.id
    });

    if (existingSubscription) {
        // If subscription exists, remove it (unsubscribe)
        await existingSubscription.remove();
        res.status(200).json(new ApiResponse({
            message: "Unsubscribed from the channel",
            subscribed: false
        }));
    } else {
        // Otherwise, create a new subscription
        await Subscription.create({
            channelId,
            subscriberId: req.user.id
        });
        res.status(200).json(new ApiResponse({
            message: "Subscribed to the channel",
            subscribed: true
        }));
    }
});

// Get the list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Find subscribers for the channel
    const subscribers = await Subscription.find({ channelId })
        .populate("subscriberId", "name email") // Assuming User model has name and email fields
        .exec();

    res.status(200).json(new ApiResponse({
        message: "Channel subscribers retrieved successfully",
        data: subscribers.map(subscription => subscription.subscriberId)
    }));
});

// Get the list of channels to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Find channels the user has subscribed to
    const subscribedChannels = await Subscription.find({ subscriberId })
        .populate("channelId", "name description") // Assuming channel has name and description
        .exec();

    res.status(200).json(new ApiResponse({
        message: "Subscribed channels retrieved successfully",
        data: subscribedChannels.map(subscription => subscription.channelId)
    }));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
