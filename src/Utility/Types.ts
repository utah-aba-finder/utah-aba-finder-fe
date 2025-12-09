export interface Service {
    id: number;
    name: string;
}

export interface Insurance {
    id: number | null,
    name: string | null;
    accepted: boolean | null;
}

export interface Location {
    id: number | null;
    name: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    services: Service[];
    in_home_waitlist: string | null;
    in_clinic_waitlist: string | null;
    isNotApplicable?: boolean;
}

export interface CountiesServed {
    county_id: number | null;
    county_name: string | null;
    state?: string;
}

export interface StateData {
    id: number;
    type: string;
    attributes: {
        name: string;
        abbreviation: string;
    };
}

export interface StatesServed {
    state: string[],
}

export interface ServiceDelivery {
    in_home: boolean;
    in_clinic: boolean;
    telehealth: boolean;
}

// Category field definition (schema) - from category_fields array
export interface CategoryField {
    id: number;
    name: string;
    field_type: 'select' | 'multi_select' | 'boolean' | 'text' | 'number' | 'date';
    options?: string[]; // For select/multi_select fields
    required?: boolean;
    validation_rules?: Record<string, any>;
    // Additional fields that may come from backend
    slug?: string;
    description?: string;
}

// Category field value - from provider_attributes hash
// Format: {"Field Name": "value"}
export type ProviderAttributesHash = Record<string, string | string[] | boolean | number | null>;

// Legacy interface for backward compatibility
export interface CategoryFieldValue {
    id: number;
    name: string;
    slug: string;
    field_type: 'select' | 'multi_select' | 'boolean' | 'text';
    value: string | string[] | boolean | null;
}

export interface ProviderAttributes {
    id: number;
    name: string | null;
    states: string[];
    provider_type: ProviderType[];
    locations: Location[];
    insurance: Insurance[];
    counties_served: CountiesServed[];
    password: string;
    username: string;
    website: string | null;
    email: string | null;
    cost: string | null;
    min_age: number | null;
    max_age: number | null;
    waitlist: string | null;
    telehealth_services: string | null;
    spanish_speakers: string | null;
    at_home_services: string | null;
    in_clinic_services: string | null;
    logo: string | null;
    logo_url?: string | null;
    updated_last: string | null;
    status: string | null;
    // New fields from API update
    in_home_only: boolean;
    service_delivery: ServiceDelivery;
    // Additional common fields for registration and editing
    contact_phone?: string | null;
    service_areas?: string[];
    waitlist_status?: string | null;
    additional_notes?: string | null;
    primary_address?: {
        street: string;
        suite: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    } | null;
    // Category and provider attributes for Educational Programs and other category-specific providers
    category?: string | null;
    category_name?: string | null;
    // provider_attributes: hash of category-specific field values (e.g., {"Program Types": "Early Learning Programs"})
    provider_attributes?: ProviderAttributesHash | null;
    // category_fields: array of field definitions/schema (only in single provider requests)
    category_fields?: CategoryField[] | null;
    // Sponsorship fields
    // Backend uses integer enum: 0=free, 1=featured, 2=sponsor, 3=partner
    // Frontend may receive as string or number
    sponsorship_tier?: string | number | null;
    is_sponsored?: boolean;
    sponsored_until?: string | null;
}

export interface InsuranceData {
    id: number;
    type: string;
    attributes: {
        name: string;
    };
}

export interface ProviderType {
  id: number;
  name: string;
}

export interface ProviderData {
    id: number;
    type: string;
    states: string[]; 
    attributes: ProviderAttributes;
    // New category-specific fields (only in single provider GET requests)
    category_name?: string | null;
    provider_attributes?: ProviderAttributesHash | null;
    category_fields?: CategoryField[] | null;
}

export interface Providers {
    data: ProviderData[];
}

interface SuperAdminEditProps {
    provider: ProviderData;
    onUpdate: (updatedProvider: ProviderAttributes) => void;
}

export interface CountyData {
  id: number;
  type: string;
  attributes: {
    name: string;
    state: string;
  };
}