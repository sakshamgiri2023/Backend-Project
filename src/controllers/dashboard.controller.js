import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Ensure channelId is valid
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Get total number of videos uploaded by the channel
    const totalVideos = await Video.countDocuments({ channelId });

    // Get total number of views for all videos of the channel
    const videoStats = await Video.aggregate([
        { $match: { channelId: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = videoStats.length > 0 ? videoStats[0].totalViews : 0;

    // Get total number of subscribers for the channel
    const totalSubscribers = await Subscription.countDocuments({ channelId });

    // Get total number of likes on all videos of the channel
    const likeStats = await Like.aggregate([
        { $match: { videoId: { $in: (await Video.find({ channelId }).select("_id")).map(v => v._id) } } },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ]);
    const totalLikes = likeStats.length > 0 ? likeStats[0].totalLikes : 0;

    // Send response with all channel stats
    res.status(200).json(new ApiResponse({
        data: {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }
    }));
});

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Ensure channelId is valid
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Get videos uploaded by the channel with pagination
    const videos = await Video.find({ channelId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by latest uploads

    const totalVideos = await Video.countDocuments({ channelId });

    res.status(200).json(new ApiResponse({
        data: videos,
        meta: {
            total: totalVideos,
            page: parseInt(page),
            limit: parseInt(limit),
        }
    }));
});

export {
    getChannelStats,
    getChannelVideos
};
