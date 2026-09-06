const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Uploads a file to Cloudinary using an unsigned upload preset, so no API secret
 * needs to live in client code. Returns the resulting media's secure URL.
 */
export async function uploadToCloudinary(file: File, resourceType: 'image' | 'video'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}
