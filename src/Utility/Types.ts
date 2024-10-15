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
}

export interface CountiesServed {
    county: string | null;
}


export interface ProviderAttributes {
    id: number;
    name: string | null;
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

export interface MockProviderData {
    id: number;
    type: string;
    attributes: ProviderAttributes;
}

export interface MockProviders {
    data: MockProviderData[];
}