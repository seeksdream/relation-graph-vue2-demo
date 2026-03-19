import { domToBlob } from 'modern-screenshot';

/**
 * Convert an HTMLElement to a Blob object
 * @param element Target DOM element
 * @param options Custom configuration options
 * @returns Promise<Blob | null>
 *
 *     // Usage example: generate JPG format
 * const jpgBlob = await domToImageByModernScreenshot(el, {
 *   type: 'image/jpeg',
 *   quality: 0.8  // Set compression quality
 * });
 */
export async function domToImageByModernScreenshot(
    element,
    options = {}
) {
    if (!element) {
        console.error('No valid HTMLElement element specified');
        return null;
    }

    try {
        // Default configuration options
        const defaultOptions = {
            scale: 2, // Set 2x pixel ratio to ensure clarity on Retina screens or when printing
            cacheBust: true, // Attempt to bypass browser cache to reduce image loading failures
            ...options
        };

        // Use domToBlob to convert the element to a blob
        const blob = await domToBlob(element, defaultOptions);
        return blob;
    } catch (error) {
        console.error('Failed to convert DOM element to image:', error);
        return null;
    }
}

/**
 * Download a Blob object as a file
 * @param blob The Blob object to download
 * @param filename The name of the file to download
 */
export function downloadBlob(blob, filename = 'download') {
    if (!blob) {
        console.error('No valid Blob specified');
        return;
    }

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}


/**
 * Convert a Blob or File object to a Base64 string
 * @param {Blob} blob - The input image Blob
 * @returns {Promise<string>} - Returns a Base64-encoded Data URL
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Success callback
    reader.onloadend = () => {
      resolve(reader.result);
    };

    // Error callback
    reader.onerror = (error) => {
      reject(error);
    };

    // Start reading
    reader.readAsDataURL(blob);
  });
};