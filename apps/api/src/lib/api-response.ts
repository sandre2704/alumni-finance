import { Response } from 'express';

interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data?: T,
    message?: string,
    pagination?: PaginationData
) => {
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
        pagination,
    });
};

export const sendSuccess = <T>(res: Response, data?: T, message?: string) => {
    sendResponse(res, 200, data, message);
};

export const sendCreated = <T>(res: Response, data?: T, message?: string) => {
    sendResponse(res, 201, data, message);
};
