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
    in_home_waitlist: boolean | null;
    in_clinic_waitlist: boolean | null;
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
    updated_last: string | null;
    status: string | null;
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