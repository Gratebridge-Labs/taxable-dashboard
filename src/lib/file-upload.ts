// 4MB — safely under Vercel's ~4.5MB serverless function request-body limit.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateFileSize(file: File): boolean {
    return file.size <= MAX_UPLOAD_BYTES;
}

export function isImage(file: File): boolean {
    return IMAGE_TYPES.includes(file.type);
}

// Downscale an image client-side until it fits under the target byte size.
export async function compressImage(file: File, targetBytes = 3.5 * 1024 * 1024): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const maxDim = 1600;
    let { width, height } = bitmap;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        bitmap.close();
        return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = 0.85;
    let blob = await canvasToBlob(canvas, file.type, quality);
    while (blob && blob.size > targetBytes && quality > 0.5) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, file.type, quality);
    }
    if (!blob) return file;
    return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Validate size, then compress images so uploads stay under the platform limit.
export async function prepareUploadFile(file: File): Promise<File | null> {
    if (!validateFileSize(file)) return null;
    if (isImage(file) && file.size > 2.5 * 1024 * 1024) {
        return compressImage(file);
    }
    return file;
}
