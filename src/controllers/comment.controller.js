import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Ensure videoId is valid
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Fetch comments with pagination
    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by latest comments

    const totalComments = await Comment.countDocuments({ videoId });
    
    res.status(200).json(new ApiResponse({
        data: comments,
        meta: {
            total: totalComments,
            page: parseInt(page),
            limit: parseInt(limit),
        }
    }));
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
        throw new ApiError(400, "Comment text is required");
    }

    // Ensure videoId is valid
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const newComment = await Comment.create({
        videoId,
        text,
        user: req.user.id // Assuming you have the user ID in the request (from a middleware like authentication)
    });

    res.status(201).json(new ApiResponse({
        message: "Comment added successfully",
        data: newComment,
    }));
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
        throw new ApiError(400, "Updated comment text is required");
    }

    // Ensure commentId is valid
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the user updating the comment is the owner
    if (comment.user.toString() !== req.user.id) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }

    comment.text = text;
    await comment.save();

    res.status(200).json(new ApiResponse({
        message: "Comment updated successfully",
        data: comment,
    }));
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Ensure commentId is valid
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the user deleting the comment is the owner
    if (comment.user.toString() !== req.user.id) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await comment.remove();

    res.status(200).json(new ApiResponse({
        message: "Comment deleted successfully",
    }));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
