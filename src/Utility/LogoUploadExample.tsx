import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadProviderLogo, validateLogoFile } from './ApiCall';

// Example: Logo Upload Component
interface LogoUploadExampleProps {
  providerId: number;
  currentLogoUrl?: string;
  onLogoUpdated: (logoUrl: string) => void;
}

const LogoUploadExample: React.FC<LogoUploadExampleProps> = ({
  providerId,
  currentLogoUrl,
  onLogoUpdated
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Example: Handling file selection with validation
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a PNG, JPEG, or GIF file');
        return;
      }
      
      setSelectedFile(file);
      toast.success('Logo file selected successfully');
    }
  };

  // Example: Uploading a logo for a provider
  const uploadLogo = async () => {
    if (!selectedFile) {
      toast.error('Please select a logo file first');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('logo', selectedFile);
      
      // Add other provider data if updating
      formData.append('name', 'Provider Name');
      formData.append('website', 'https://example.com');
      // ... other fields
      
      const response = await fetch(`/api/v1/providers/${providerId}`, {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Handle the updated provider data
      if (result.data?.[0]?.attributes?.logo) {
        onLogoUpdated(result.data[0].attributes.logo);
        toast.success('Logo uploaded successfully!');
        setSelectedFile(null);
      }
      
    } catch (error) {

      toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Example: Displaying provider logos
  const displayProviderLogo = () => {
    if (currentLogoUrl) {
      // Provider has a logo - display it
      return (
        <img 
          src={currentLogoUrl} 
          alt="Provider Logo" 
          className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
          onError={(e) => {
            // Fallback if logo fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
    
          }}
        />
      );
    } else {
      // Provider has no logo - show default logo
      return (
        <img 
          src="/src/Assets/ASL_Logo_No_Letters.png" 
          alt="Default Provider Logo" 
          className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
        />
      );
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">Logo Management</h3>
      
      {/* Current Logo Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Logo
        </label>
        {displayProviderLogo()}
      </div>
      
      {/* File Input for Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload New Logo
        </label>
        <input 
          type="file" 
          id="logo-upload" 
          accept="image/png,image/jpeg,image/gif"
          onChange={handleLogoChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PNG, JPEG, GIF. Max size: 5MB
        </p>
      </div>
      
      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={uploadLogo}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isUploading ? "Uploading..." : "Upload Logo"}
        </button>
      )}
      
      {/* File Information */}
      {selectedFile && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium text-green-800">
                Selected: {selectedFile.name}
              </span>
              <span className="text-xs text-green-600 block">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoUploadExample; 