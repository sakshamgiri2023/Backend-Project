import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Healthcheck response with OK status
    res.status(200).json(new ApiResponse({
        message: "API is running smoothly",
        status: "OK"
    }));
});

export {
    healthcheck
};
