# Primary Location Management - Proper Solution

## Problem
Primary location (index 0) gets pushed down when adding new locations because we're using array index to determine "primary" - this is fragile and unreliable.

## Root Cause
**Array index is NOT a property** - databases don't guarantee stable order. Using index 0 as "primary" will always be fragile.

## The Real Fix: Store Primary in Database

### ✅ Recommended: `providers.primary_location_id` (Best Option)

**Schema:**
```ruby
add_column :providers, :primary_location_id, :integer
add_foreign_key :providers, :locations, column: :primary_location_id
```

**Why this is best:**
- Primary is a **property**, not ordering side-effect
- Stable and reliable
- Primary never changes unless user explicitly selects it
- When adding new location, primary stays the same (no reordering needed)
- Clear intent, easy to query

**Backend Implementation:**
```ruby
# Provider model
belongs_to :primary_location, class_name: 'Location', optional: true

def ordered_locations
  return locations.order(:created_at, :id) unless primary_location_id.present?
  primary = locations.find_by(id: primary_location_id)
  others = locations.where.not(id: primary_location_id).order(:created_at, :id)
  [primary, *others].compact
end
```

**Frontend After Implementation:**
```typescript
// Add new location - primary never changes!
await fetch(`/api/v1/providers/${id}/locations`, {
  method: 'POST',
  body: JSON.stringify({ location: newLocation })
});

// To change primary, explicit action
await fetch(`/api/v1/providers/${id}/primary_location`, {
  method: 'PATCH',
  body: JSON.stringify({ primary_location_id: locationId })
});
```

### Alternative: `locations.primary:boolean`

**Schema:**
```ruby
add_column :locations, :primary, :boolean, default: false
add_index :locations, [:provider_id, :primary]

# Validation
validates :primary, uniqueness: { 
  scope: :provider_id, 
  conditions: -> { where(primary: true) } 
}
```

### Alternative: `locations.position:integer`

**Schema:**
```ruby
add_column :locations, :position, :integer
add_index :locations, [:provider_id, :position]

# Default scope
scope :ordered, -> { order(:position, :id) }
```

## Current Temporary Workaround (Frontend)

Until backend implements proper schema, frontend is using:
1. POST new location
2. Fetch all locations
3. Check if primary moved (index 0 changed)
4. If yes, reorder and PATCH all locations

**This is compensating for backend model problem** - fragile but workable temporarily.

## Backend Requirements

### Critical: Deterministic Ordering

Always return locations in deterministic order - never rely on natural DB order.

```ruby
# BAD - no order guarantee
provider.locations

# GOOD - explicit order
provider.locations.order(:created_at, :id)
# OR
provider.locations.order(:position, :id)
# OR use primary_location_id logic above
```

### Avoid `destroy_all` Pattern

❌ **Don't do this:**
```ruby
provider.locations.destroy_all
locations_params.each { |loc| provider.locations.create(loc) }
```

**Problems:**
- Breaks IDs (frontend references)
- Breaks audit/history
- Breaks attachments/associations
- Can create new primary if order changes

## Questions for Backend Team

1. Can we add `providers.primary_location_id` column? (Recommended)
2. What is the Location model structure?
3. What controller handles `/api/v1/provider_self` PATCH?
4. How are locations currently ordered when fetching?
5. Do you use `destroy_all` and recreate pattern? (Should be avoided)

## Recommended Action Plan

1. **Backend:** Add `providers.primary_location_id` column
2. **Backend:** Update model to return locations with primary first
3. **Backend:** Add endpoint to change primary: `PATCH /api/v1/providers/:id/primary_location`
4. **Frontend:** Remove temporary reordering logic
5. **Frontend:** Use `primary_location_id` from API response
6. **Both:** Clean up `destroy_all` recreate pattern

