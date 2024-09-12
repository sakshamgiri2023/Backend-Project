import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if user already liked the video
    const existingLike = await Like.findOne({
        videoId,
        userId: req.user.id
    });

    if (existingLike) {
        // If like exists, remove it (unlike the video)
        await existingLike.remove();
        res.status(200).json(new ApiResponse({
            message: "Like removed from video",
            liked: false
        }));
    } else {
        // Otherwise, add a like
        await Like.create({
            videoId,
            userId: req.user.id
        });
        res.status(200).json(new ApiResponse({
            message: "Like added to video",
            liked: true
        }));
    }
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check if user already liked the comment
    const existingLike = await Like.findOne({
        commentId,
        userId: req.user.id
    });

    if (existingLike) {
        // If like exists, remove it (unlike the comment)
        await existingLike.remove();
        res.status(200).json(new ApiResponse({
            message: "Like removed from comment",
            liked: false
        }));
    } else {
        // Otherwise, add a like
        await Like.create({
            commentId,
            userId: req.user.id
        });
        res.status(200).json(new ApiResponse({
            message: "Like added to comment",
            liked: true
        }));
    }
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if user already liked the tweet
    const existingLike = await Like.findOne({
        tweetId,
        userId: req.user.id
    });

    if (existingLike) {
        // If like exists, remove it (unlike the tweet)
        await existingLike.remove();
        res.status(200).json(new ApiResponse({
            message: "Like removed from tweet",
            liked: false
        }));
    } else {
        // Otherwise, add a like
        await Like.create({
            tweetId,
            userId: req.user.id
        });
        res.status(200).json(new ApiResponse({
            message: "Like added to tweet",
            liked: true
        }));
    }
});

// Get all liked videos by the user
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find all likes for videos by the user
    const likedVideos = await Like.find({ userId, videoId: { $exists: true } })
        .populate("videoId")  // Assuming you want the video data populated
        .exec();

    res.status(200).json(new ApiResponse({
        message: "Liked videos retrieved successfully",
        data: likedVideos.map(like => like.videoId) // Return only the video details
    }));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
