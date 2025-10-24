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

/**
 * Pick an image from gallery/photos (mobile) or file system (web)
 */
export const pickImageFromGallery = async (options: Partial<CaptureOptions>): Promise<CapturedImage> => {
  try {
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      correctOrientation: true,
      width: 1920,
      height: 1920,
    });

    if (!image.base64String) {
      throw new Error('Failed to load image data');
    }

    const timestamp = Date.now();
    const fileName = `retinal_uploaded_${timestamp}.jpg`;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: image.base64String,
      directory: Directory.Data
    });

    return {
      uri: image.webPath || `data:image/jpeg;base64,${image.base64String}`,
      path: savedFile.uri,
      fileName
    };
  } catch (error) {
    console.error('Image picker failed:', error);
    throw error;
  }
};

/**
 * Handle file upload from web browser (desktop)
 */
export const uploadImageFromFile = async (file: File): Promise<CapturedImage> => {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Please upload JPEG or PNG images.'));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('File too large. Maximum size is 10MB.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const fileName = `retinal_uploaded_${Date.now()}_${file.name}`;
      
      resolve({
        uri: base64,
        path: base64,
        fileName
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate if an image is suitable for retinal analysis
 */
export const validateRetinalImage = async (base64Data: string): Promise<{
  isValid: boolean;
  reason?: string;
  dimensions?: { width: number; height: number };
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const minSize = 512;
      const maxSize = 4096;
      
      if (img.width < minSize || img.height < minSize) {
        resolve({
          isValid: false,
          reason: `Image too small. Minimum size is ${minSize}x${minSize}px`,
          dimensions: { width: img.width, height: img.height }
        });
        return;
      }
      
      if (img.width > maxSize || img.height > maxSize) {
        resolve({
          isValid: false,
          reason: `Image too large. Maximum size is ${maxSize}x${maxSize}px`,
          dimensions: { width: img.width, height: img.height }
        });
        return;
      }
      
      resolve({
        isValid: true,
        dimensions: { width: img.width, height: img.height }
      });
    };
    
    img.onerror = () => {
      resolve({
        isValid: false,
        reason: 'Failed to load image. File may be corrupted.'
      });
    };
    
    img.src = base64Data;
  });
};
