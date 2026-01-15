import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadService {
    private useCloudinary: boolean;

    constructor() {
        this.useCloudinary = !!(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        );
        console.log(`Upload Service Initialized. Using: ${this.useCloudinary ? 'Cloudinary' : 'Local Storage'}`);
    }

    async uploadFile(buffer: Buffer, originalName?: string, folder: string = 'alumni-finance'): Promise<{ url: string; publicId: string }> {
        if (this.useCloudinary) {
            return this.uploadToCloudinary(buffer, folder);
        } else {
            return this.uploadToLocal(buffer, originalName);
        }
    }

    private async uploadToCloudinary(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        return reject(error);
                    }
                    if (!result) return reject(new Error('Upload failed'));

                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
    }

    private async uploadToLocal(buffer: Buffer, originalName: string = 'file'): Promise<{ url: string; publicId: string }> {
        try {
            console.log('Starting Local Upload...');
            // Ensure uploads directory exists
            const uploadDir = path.join(process.cwd(), 'uploads');
            console.log('Upload Directory:', uploadDir);

            if (!fs.existsSync(uploadDir)) {
                console.log('Creating upload directory...');
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Generate unique filename
            const timestamp = Date.now();
            const safeName = originalName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const filename = `${timestamp}-${safeName}`;
            const filePath = path.join(uploadDir, filename);

            console.log('Writing file to:', filePath);

            // Write file
            await fs.promises.writeFile(filePath, buffer);

            // Construct URL
            // Assuming the server serves 'uploads' folder at '/uploads' path
            const baseUrl = env.BETTER_AUTH_URL || `http://localhost:${env.PORT}`;
            const url = `${baseUrl}/uploads/${filename}`;

            console.log(`File saved locally: ${filePath}`);
            console.log(`Public URL: ${url}`);

            return {
                url,
                publicId: filename,
            };
        } catch (error) {
            console.error('Local Upload Failed:', error);
            throw error;
        }
    }
}

export const uploadService = new UploadService();
