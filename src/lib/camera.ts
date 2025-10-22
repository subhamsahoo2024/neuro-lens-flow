import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface CaptureOptions {
  eye: 'left' | 'right';
  mode: 'macula' | 'disc';
  flash: boolean;
}

export interface CapturedImage {
  uri: string;
  path: string;
  fileName: string;
}

/**
 * Check if we're running in a native mobile environment
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check and request camera permissions
 */
export const checkCameraPermissions = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    return true; // Web environment, permissions handled by browser
  }

  try {
    const status = await Camera.checkPermissions();
    if (status.camera !== 'granted') {
      const request = await Camera.requestPermissions();
      return request.camera === 'granted';
    }
    return true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
};

/**
 * Capture a retinal image using the native camera
 */
export const captureRetinalImage = async (options: CaptureOptions): Promise<CapturedImage> => {
  try {
    // Check permissions first
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    // Capture image with high quality settings for medical imaging
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: false,
      correctOrientation: true,
      width: 1920, // High resolution for medical imaging
      height: 1920,
    });

    if (!image.base64String) {
      throw new Error('Failed to capture image data');
    }

    // Generate filename with metadata
    const timestamp = Date.now();
    const fileName = `retinal_${options.eye}_${options.mode}_${timestamp}.jpg`;

    // Save to app's private storage
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: image.base64String,
      directory: Directory.Data
    });

    // Return both web path (for display) and file URI (for storage)
    return {
      uri: image.webPath || `data:image/jpeg;base64,${image.base64String}`,
      path: savedFile.uri,
      fileName
    };
  } catch (error) {
    console.error('Camera capture failed:', error);
    throw error;
  }
};

/**
 * Simulate image capture for web/development environment
 */
export const simulateCaptureForWeb = async (options: CaptureOptions): Promise<CapturedImage> => {
  // Return mock data for web environment
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uri: '/placeholder.svg',
        path: 'mock://placeholder',
        fileName: `mock_${options.eye}_${options.mode}_${Date.now()}.jpg`
      });
    }, 1000);
  });
};

/**
 * Delete an image from storage
 */
export const deleteImage = async (fileName: string): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Data
    });
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
};

/**
 * Get a stored image as base64
 */
export const getStoredImage = async (fileName: string): Promise<string> => {
  if (!isNativePlatform()) {
    return '/placeholder.svg';
  }

  try {
    const file = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data
    });
    return `data:image/jpeg;base64,${file.data}`;
  } catch (error) {
    console.error('Failed to read image:', error);
    throw error;
  }
};
