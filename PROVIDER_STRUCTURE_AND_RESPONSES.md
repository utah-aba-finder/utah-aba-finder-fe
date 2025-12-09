# Provider Structure & Responses

## Overview

The provider API now supports category-specific fields while maintaining backward compatibility with existing standard fields.

## Response Structure

### Single Provider Request (`GET /api/v1/providers/:id`)

Single provider requests include all standard fields **plus** category-specific fields:

```json
{
  "data": [
    {
      "id": 123,
      "type": "provider",
      "attributes": {
        "name": "Example Provider",
        "email": "example@example.com",
        "website": "https://example.com",
        // ... standard fields
      }
    }
  ],
  "category_name": "Educational Programs",
  "provider_attributes": {
    "Program Types": "Early Learning Programs, PreK-2 Curriculum",
    "Credentials/Qualifications": "State Licensed"
  },
  "category_fields": [
    {
      "id": 100,
      "name": "Program Types",
      "field_type": "multi_select",
      "options": ["Early Learning Programs", "PreK-2 Curriculum", "Elementary"],
      "required": false
    },
    {
      "id": 101,
      "name": "Credentials/Qualifications",
      "field_type": "text",
      "required": true
    }
  ]
}
```

### Provider List Request (`GET /api/v1/providers`)

Provider list requests include **only** standard fields (no `provider_attributes` or `category_fields` for performance):

```json
{
  "data": [
    {
      "id": 123,
      "type": "provider",
      "attributes": {
        "name": "Example Provider",
        "email": "example@example.com",
        // ... standard fields only
      }
    }
  ]
}
```

## Field Definitions

### `provider_attributes`
- **Type**: `Record<string, string | string[] | boolean | number | null>`
- **Description**: Hash of category-specific field values
- **Format**: `{"Field Name": "value"}`
- **Example**: `{"Program Types": "Early Learning Programs, PreK-2 Curriculum"}`
- **Availability**: Only in single provider requests

### `category_fields`
- **Type**: `CategoryField[]`
- **Description**: Array of field definitions/schema
- **Contains**: Field definitions with types, options, validation rules
- **Availability**: Only in single provider requests

### `category_name`
- **Type**: `string | null`
- **Description**: Display name for the provider category
- **Example**: `"Educational Programs"`
- **Availability**: Only in single provider requests

## Data Storage

- **Standard fields**: Stored directly in `providers` table (name, email, website, etc.)
- **Category-specific fields**: Stored in `provider_attributes` table linked to `category_fields`
- **Field definitions**: Stored in `category_fields` table

## Frontend Usage

### TypeScript Interfaces

```typescript
import { ProviderData, ProviderAttributes, CategoryField, ProviderAttributesHash } from './Utility/Types';

// Access provider data
const provider: ProviderData = await fetchSingleProvider(providerId);

// Access category-specific attributes
const programTypes = provider.provider_attributes?.["Program Types"];

// Access field definitions
const fieldDefinitions = provider.category_fields;

// Access category name
const categoryName = provider.category_name;
```

### Accessing Provider Attributes

```typescript
// In ProviderEdit component or similar
const provider = loggedInProvider;

// Standard fields (always available)
const name = provider.attributes.name;
const email = provider.attributes.email;

// Category-specific fields (only in single provider requests)
const providerAttributes = provider.attributes.provider_attributes;
if (providerAttributes) {
  const programTypes = providerAttributes["Program Types"];
  const credentials = providerAttributes["Credentials/Qualifications"];
}

// Field definitions for rendering forms
const categoryFields = provider.attributes.category_fields;
if (categoryFields) {
  categoryFields.forEach(field => {
    console.log(`Field: ${field.name}, Type: ${field.field_type}`);
    if (field.options) {
      console.log(`Options: ${field.options.join(', ')}`);
    }
  });
}
```

### Normalization

The `normalizeProviderDetail` function in `AuthProvider.tsx` automatically includes the new fields:

```typescript
const normalized = normalizeProviderDetail(apiResponse);
// normalized.attributes now includes:
// - category_name
// - provider_attributes
// - category_fields
// - category
```

## Backward Compatibility

All existing fields remain unchanged. The new fields are **additive**, so existing frontend code continues to work without modification.

### Checking for Category Fields

```typescript
// Check if provider has category-specific fields
if (provider.attributes.category_fields && provider.attributes.category_fields.length > 0) {
  // This is a category-specific provider
  const categoryName = provider.attributes.category_name;
  const attributes = provider.attributes.provider_attributes;
  
  // Render category-specific fields
} else {
  // Standard provider - use existing logic
}
```

## Migration Notes

1. **No breaking changes**: Existing code will continue to work
2. **Optional fields**: All new fields are optional and may be `null`
3. **Single provider only**: Category fields are only available in single provider requests
4. **Type safety**: TypeScript interfaces are updated to include new fields

## Example: Rendering Category Fields

```typescript
function renderCategoryFields(provider: ProviderData) {
  if (!provider.attributes.category_fields || !provider.attributes.provider_attributes) {
    return null;
  }

  return (
    <div className="category-fields">
      <h3>{provider.attributes.category_name}</h3>
      {provider.attributes.category_fields.map(field => {
        const value = provider.attributes.provider_attributes?.[field.name];
        
        return (
          <div key={field.id}>
            <label>{field.name}</label>
            {field.field_type === 'multi_select' && Array.isArray(value) ? (
              <div>{value.join(', ')}</div>
            ) : (
              <div>{String(value || '')}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

## API Response Examples

### Educational Programs Provider

```json
{
  "data": [{
    "id": 456,
    "type": "provider",
    "attributes": {
      "name": "ABC Learning Center",
      "email": "info@abclearning.com"
    }
  }],
  "category_name": "Educational Programs",
  "provider_attributes": {
    "Program Types": "Early Learning Programs, PreK-2 Curriculum",
    "Credentials/Qualifications": "State Licensed, NAEYC Accredited"
  },
  "category_fields": [
    {
      "id": 100,
      "name": "Program Types",
      "field_type": "multi_select",
      "options": ["Early Learning Programs", "PreK-2 Curriculum", "Elementary"],
      "required": false
    }
  ]
}
```

### Standard Provider (No Category)

```json
{
  "data": [{
    "id": 789,
    "type": "provider",
    "attributes": {
      "name": "Standard Provider",
      "email": "info@standard.com"
    }
  }]
}
```

Note: Standard providers won't have `category_name`, `provider_attributes`, or `category_fields`.

