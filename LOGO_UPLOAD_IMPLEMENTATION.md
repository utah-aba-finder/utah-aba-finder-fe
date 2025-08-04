# Logo Upload Implementation Guide

This document outlines the complete implementation of logo upload functionality for the Utah ABA Finder frontend, following the exact requirements provided.

## 1. Logo Upload (Multipart Form Data)

### Frontend Implementation

The frontend sends logo uploads as multipart/form-data using the following pattern:

```typescript
// Example: Uploading a logo for a provider
const uploadLogo = async (providerId: number, logoFile: File) => {
  const formData = new FormData();
  formData.append('logo', logoFile);
  
  // Add other provider data if updating
  formData.append('name', providerName);
  formData.append('website', website);
  // ... other fields
  
  const response = await fetch(`/api/v1/providers/${providerId}`, {
    method: 'PUT',
    body: formData,
    // Don't set Content-Type header - browser will set it automatically with boundary
  });
  
  return response.json();
};
```

### Key Implementation Points:

1. **FormData Creation**: Uses `FormData` to create multipart form data
2. **File Attachment**: Appends the logo file directly to FormData
3. **Additional Data**: Includes other provider fields as needed
4. **Content-Type**: Browser automatically sets the correct Content-Type with boundary
5. **HTTP Method**: Uses PUT method for updating provider with logo

## 2. Handling Logo URLs in API Responses

### Frontend Implementation

The frontend expects and handles logo URLs in API responses:

```typescript
// Example: Fetching providers and handling logo URLs
const fetchProviders = async () => {
  const response = await fetch('/api/v1/providers');
  const data = await response.json();
  
  data.data.forEach(provider => {
    const logoUrl = provider.attributes.logo;
    
    if (logoUrl) {
      // Provider has a logo - display it
      displayLogo(logoUrl);
    } else {
      // Provider has no logo - show placeholder
      displayPlaceholder();
    }
  });
};
```

### Implementation in ProviderCard.tsx:

```typescript
// Enhanced logo display with fallback
{provider.logo ? (
  <img 
    src={provider.logo} 
    alt={`${provider.name} Logo`} 
    className="provider-logo"
    onError={(e) => {
      // Fallback to default logo if logo fails to load
      const target = e.target as HTMLImageElement;
      target.src = defaultLogo;
      console.warn(`Failed to load logo for ${provider.name}, using fallback`);
    }}
  />
) : (
  <img src={defaultLogo} alt="Default Provider Logo" className="provider-logo" />
)}
```

## 3. Displaying Logos

### Implementation Pattern

```typescript
// Example: Displaying provider logos
const displayProviderLogo = (provider) => {
  const logoElement = document.getElementById('provider-logo');
  
  if (provider.attributes.logo) {
    logoElement.src = provider.attributes.logo;
    logoElement.style.display = 'block';
  } else {
    logoElement.style.display = 'none';
    // Or show a placeholder image
  }
};
```

### Enhanced Display with Error Handling:

```typescript
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
          console.warn('Logo failed to load, hiding element');
        }}
      />
    );
  } else {
    // Provider has no logo - show placeholder
    return (
      <div className="w-32 h-32 bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-sm">No Logo</span>
      </div>
    );
  }
};
```

## 4. File Input for Logo Upload

### HTML Implementation

```html
<!-- HTML for logo upload -->
<input 
  type="file" 
  id="logo-upload" 
  accept="image/png,image/jpeg,image/gif"
  onChange={handleLogoChange}
/>
```

### JavaScript Implementation

```typescript
// JavaScript for handling file selection
const handleLogoChange = (event) => {
  const file = event.target.files[0];
  
  if (file) {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PNG, JPEG, or GIF file');
      return;
    }
    
    // Proceed with upload
    uploadLogo(providerId, file);
  }
};
```

## 5. File Validation

### Client-Side Validation

```typescript
export const validateLogoFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please select a PNG, JPEG, or GIF file' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};
```

### Validation in File Input Handler

```typescript
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
```

## 6. Error Handling

### Upload Error Handling

```typescript
try {
  const response = await fetch(`/api/v1/providers/${providerId}`, {
    method: 'PUT',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  // Handle success
  
} catch (error) {
  console.error('Error uploading logo:', error);
  toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### Display Error Handling

```typescript
<img 
  src={logoUrl} 
  alt="Provider Logo" 
  onError={(e) => {
    // Fallback to placeholder if logo fails to load
    const target = e.target as HTMLImageElement;
    target.src = placeholderImage;
    console.warn('Logo failed to load, using fallback');
  }}
/>
```

## 7. API Endpoints

### Working Endpoints

- **GET** `/api/v1/providers` - Returns providers with logo URLs
- **PUT** `/api/v1/providers/:id` - Accepts logo uploads via multipart form
- **DELETE** `/api/v1/providers/:id/remove_logo` - Removes provider logo

### Example Usage

```typescript
// Upload logo
const uploadResponse = await fetch(`/api/v1/providers/${providerId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'be6205db57ce01863f69372308c41e3a',
  },
  body: formData
});

// Remove logo
const removeResponse = await fetch(`/api/v1/providers/${providerId}/remove_logo`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'be6205db57ce01863f69372308c41e3a',
  }
});
```

## 8. Production Readiness

### Backend Configuration

The backend is properly configured for:
- ✅ Logo uploads in production
- ✅ Logo URL generation with correct host
- ✅ Error handling and fallbacks
- ✅ Both development and production environments

### Frontend Implementation

The frontend implements:
- ✅ Multipart form upload
- ✅ File validation (size and type)
- ✅ Error handling and user feedback
- ✅ Logo display with fallbacks
- ✅ Logo removal functionality

## 9. Complete Example Component

See `src/Utility/LogoUploadExample.tsx` for a complete implementation example that demonstrates all the required functionality.

## 10. Integration Points

### ProviderEdit Component

The logo upload functionality is integrated into the ProviderEdit component in the "Provider Details" tab, providing a complete interface for logo management.

### ProviderCard Component

The ProviderCard component displays logos with proper fallback handling and error management.

### ApiCall Utility

The ApiCall utility provides comprehensive logo upload functions with proper error handling and validation.

## Summary

This implementation provides a complete, production-ready logo upload system that:

1. ✅ Uses multipart/form-data for uploads
2. ✅ Handles logo URLs in API responses
3. ✅ Displays logos with fallbacks
4. ✅ Validates files (5MB limit, PNG/JPEG/GIF only)
5. ✅ Provides comprehensive error handling
6. ✅ Works in both development and production
7. ✅ Includes logo removal functionality
8. ✅ Follows all specified requirements exactly

The implementation is ready for production use and provides a robust, user-friendly logo management system. 