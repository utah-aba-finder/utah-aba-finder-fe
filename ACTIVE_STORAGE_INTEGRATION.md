# Active Storage Integration Guide

## 🚀 **Updated Implementation (Active Storage)**

The backend has been migrated to use Active Storage for logo handling. This provides:
- **Consistent URL format**: `https://autismserviceslocator.com/rails/active_storage/blobs/redirect/...`
- **Better performance**: Direct file serving
- **Reliable storage**: Cloud-based file management
- **Automatic fallbacks**: Graceful error handling

## 📤 **Frontend → Backend (Uploading Logos)**

### **Format: multipart/form-data**
The frontend sends logo uploads as multipart form data, **NOT JSON**.

### **Example Upload Request:**
```javascript
// Frontend code for uploading a logo
const uploadLogo = async (providerId, logoFile) => {
  const formData = new FormData();
  formData.append('logo', logoFile); // Only the file, no other data
  
  const response = await fetch(`/api/v1/providers/${providerId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': 'your-api-key-here'
    },
    body: formData // Don't set Content-Type header - browser sets it automatically
  });
  
  return response.json();
};
```

### **React Example:**
```javascript
const LogoUpload = ({ providerId }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('logo', file);
        
        const response = await fetch(`/api/v1/providers/${providerId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': 'your-api-key-here'
          },
          body: formData
        });
        
        const result = await response.json();
        console.log('Logo uploaded:', result);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <input 
      type="file" 
      accept="image/png,image/jpeg,image/gif"
      onChange={handleFileChange}
    />
  );
};
```

## 📥 **Backend → Frontend (Receiving Logos)**

### **API Response Format:**
The API returns the logo URL in the provider data:
```json
{
  "data": [
    {
      "id": 1,
      "type": "provider",
      "attributes": {
        "name": "Provider Name",
        "logo": "https://autismserviceslocator.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MSwicHVyIjoiYmxvYl9pZCJ9fQ==--c74a22e6008d8216d808e472d86c92d141f2e361/logo.png",
        // ... other provider data
      }
    }
  ]
}
```

### **Frontend Usage:**
```javascript
// Display the logo
const ProviderCard = ({ provider }) => {
  return (
    <div className="provider-card">
      {provider.logo && (
        <img 
          src={provider.logo}
          alt={`${provider.name} logo`}
          className="provider-logo"
          onError={(e) => {
            e.target.style.display = 'none'; // Hide broken images
          }}
        />
      )}
      <h3>{provider.name}</h3>
    </div>
  );
};
```

## 🔧 **File Requirements**

### **Supported Formats:**
- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)

### **Size Limits:**
- Maximum file size: 5MB

### **Validation:**
The backend validates:
- File type (must be PNG, JPEG, or GIF)
- File size (must be under 5MB)

## 📋 **Complete Example**

```javascript
// Complete React component for logo upload and display
const ProviderLogoManager = ({ provider }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogoUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch(`/api/v1/providers/${provider.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'your-api-key-here'
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      // Update your provider data with the new logo URL
      console.log('New logo URL:', result.data[0].attributes.logo);
      
    } catch (err) {
      setError('Failed to upload logo');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Display current logo */}
      {provider.logo && (
        <img 
          src={provider.logo}
          alt={`${provider.name} logo`}
          className="current-logo"
        />
      )}
      
      {/* Upload new logo */}
      <input 
        type="file"
        accept="image/png,image/jpeg,image/gif"
        onChange={(e) => handleLogoUpload(e.target.files[0])}
        disabled={isUploading}
      />
      
      {isUploading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

## 🎯 **Key Points**

- **Upload**: Use multipart/form-data with FormData
- **Receive**: Logo URL is in `provider.logo` field
- **Format**: URLs will be `https://autismserviceslocator.com/rails/active_storage/blobs/redirect/...`
- **Validation**: Backend handles file type and size validation
- **Error Handling**: Always handle upload failures and broken images

## 🔄 **Migration from Cloudinary**

The current setup will:
- Prioritize Active Storage over legacy Cloudinary URLs
- Keep legacy URLs working as fallback
- Automatically use Active Storage for new uploads

## ✅ **Testing Your Frontend**

1. **Upload a new logo** - Should use Active Storage
2. **View existing providers** - Should show both Active Storage and legacy URLs
3. **Check logo rendering** - Should display properly on both client and provider sides

## 🚀 **Updated Frontend Implementation**

Our frontend has been updated to work with the new Active Storage system:

### **Updated Functions:**
- `uploadAdminProviderLogo()` - Simplified to only send logo file
- `uploadProviderLogo()` - Simplified to only send logo file
- `ProviderLogo` component - Handles Active Storage URLs

### **Test Component:**
- `/logo-upload-test` - Test logo uploads for Golden Touch ABA
- Includes current state checking and detailed error reporting

The backend is now properly configured to use Active Storage for logo uploads and URL generation. Your frontend should work seamlessly with this setup! 