const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const UPLOAD_TIMEOUT_MS = 120_000;

/**
 * Uploads a file to Cloudinary using an unsigned upload preset, so no API secret
 * needs to live in client code. Returns the resulting media's secure URL.
 *
 * Uses XMLHttpRequest rather than fetch: fetch() uploads with large FormData bodies
 * are known to hang indefinitely on iOS Safari, especially over cellular. XHR handles
 * large uploads reliably there, and the explicit timeout below guarantees this rejects
 * with a clear error instead of spinning forever if the connection stalls.
 */
export function uploadToCloudinary(file: File, resourceType: 'image' | 'video'): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url: string };
          resolve(data.secure_url);
        } catch {
          reject(new Error('Upload succeeded but the response was unreadable.'));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed — check your connection and try again.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out — check your connection and try again.'));

    xhr.send(formData);
  });
}
