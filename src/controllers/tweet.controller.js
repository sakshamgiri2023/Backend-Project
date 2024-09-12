import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        content,
        user: req.user.id  // Assuming req.user.id is the authenticated user
    });

    res.status(201).json(new ApiResponse({
        message: "Tweet created successfully",
        data: tweet
    }));
});

// Get all tweets from a specific user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse({
        message: "User tweets retrieved successfully",
        data: tweets
    }));
});

// Update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.findOne({ _id: tweetId, user: req.user.id });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(new ApiResponse({
        message: "Tweet updated successfully",
        data: tweet
    }));
});

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findOne({ _id: tweetId, user: req.user.id });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to delete this tweet");
    }

    await tweet.remove();

    res.status(200).json(new ApiResponse({
        message: "Tweet deleted successfully"
    }));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
