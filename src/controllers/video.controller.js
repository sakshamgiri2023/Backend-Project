import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const queryObject = {};
    if (query) {
        queryObject.title = { $regex: query, $options: 'i' };
    }
    if (userId && isValidObjectId(userId)) {
        queryObject.owner = new mongoose.Types.ObjectId(userId);
    }

    const videos = await Video.find(queryObject)
        .populate('owner', 'username avatar')
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalVideos = await Video.countDocuments(queryObject);

    return res.status(200).json(new ApiResponse(200, {
        videos,
        total: totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: Number(page)
    }, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile } = req.files;

    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    const video = await uploadOnCloudinary(videoFile.path);

    const newVideo = await Video.create({
        title,
        description,
        videoUrl: video.url,
        thumbnail: video.thumbnail || '',
        owner: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate('owner', 'username avatar');

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const { thumbnailFile } = req.files;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updateFields = { title, description };

    if (thumbnailFile) {
        const thumbnail = await uploadOnCloudinary(thumbnailFile.path);
        updateFields.thumbnail = thumbnail.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, { new: true });

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.videoUrl) {
        const publicId = video.videoUrl.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.published = !video.published;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, `Video ${video.published ? 'published' : 'unpublished'} successfully`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
