export interface Insurance {
    name: string | null;
}

export interface Location {
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

export interface Services {
    telehealth_services: string | null;
    spanish_speakers: string | null;
    at_home_services: string | null;
    in_clinic_services: string | null;
}

export interface ProviderAttributes {
    name: string | null;
    locations: Location[];
    insurance: Insurance[];
    counties_served: { county: string | null }[];
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
  }

export interface MockProviderData {
    id: number;
    type: string;
    attributes: ProviderAttributes;
}

export interface MockProviders {
    data: MockProviderData[];
}

export const mockProviders: MockProviders = {
    data: [
        {
            id: 1,
            type: "provider",
            attributes: {
                name: "A BridgeCare ABA",
                locations: [
                    {
                        name: "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        address_1: "744 E 400 S",
                        address_2: "Suite B",
                        city: "Salt Lake City",
                        state: "UT",
                        zip: "84102",
                        phone: "801-435-8088",
                    },
                ],
                website: "https://www.bridgecareaba.com/locations/utah",
                email: "info@bridgecareaba.com",
                cost: "N/A",
                insurance: [
                    { 
                        name: "Contact us"
                    },
                    {
                        name: "Aetna"
                    },
                    {
                        name: "Regence (BCBS)"
                    },
                    {
                        name: "Cigna"
                    },
                    {
                        name: "Health Choice Utah"
                    },
                    {
                        name: "Healthy U Medicaid (University of Utah Health Plans)"
                    },
                    {
                        name: "United HealthCare (UHC)"
                    }
                ],
                counties_served: [
                    {
                        county: "Salt Lake, Utah, Davis, Weber"
                    }
                ],
                min_age: 2.0,
                max_age: 21.0,
                waitlist: "No",
                telehealth_services: "Yes",
                spanish_speakers: "Yes",
                at_home_services: null,
                in_clinic_services: null,
            },
        },
        {
            id: 2,
            type: "provider",
            attributes: {
                name: "A.B.I. Learning Center",
                locations: [
                    {
                        name: "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        address_1: "744 E 400 S",
                        address_2: "Suite B",
                        city: "Salt Lake City",
                        state: "UT",
                        zip: "84102",
                        phone: "801-435-8088",
                    },
                ],
                website: "https://www.bridgecareaba.com/locations/utah",
                email: "info@bridgecareaba.com",
                cost: "N/A",
                insurance: [
                    { 
                        name: "Contact us" 
                    },
                    {
                        name: "United HealthCare (UHC)"
                    }
                ],
                counties_served: [
                    {
                        county: "Salt Lake, Utah, Davis, Weber"
                    }
                ],
                min_age: 2.0,
                max_age: 21.0,
                waitlist: "No",
                telehealth_services: "Yes",
                spanish_speakers: "Yes",
                at_home_services: null,
                in_clinic_services: null,
            },
        },
        {
            id: 3,
            type: "provider",
            attributes: {
                name: "ABA Blue Gems Therapy",
                locations: [
                    {
                        name: "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        address_1: "744 E 400 S",
                        address_2: "Suite B",
                        city: "Salt Lake City",
                        state: "UT",
                        zip: "84102",
                        phone: "801-435-8088",
                    },
                ],
                website: "https://www.bridgecareaba.com/locations/utah",
                email: "info@bridgecareaba.com",
                cost: "N/A",
                insurance: [{ name: "Contact us" }],
                counties_served: [
                    {
                        county: "Utah, Davis, Weber"
                    }
                ],
                min_age: 2.0,
                max_age: 21.0,
                waitlist: "No",
                telehealth_services: "Yes",
                spanish_speakers: "Yes",
                at_home_services: null,
                in_clinic_services: null,
            },
        },
        {
            id: 4,
            type: "provider",
            attributes: {
                name: "Brighter Strides ABA",
                locations: [
                    {
                        name: "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        address_1: "2540 East Bengal Blvd",
                        address_2: "suite 300",
                        city: "Cottonwood Heights",
                        state: "UT",
                        zip: "84121",
                        phone: "801-435-8088",
                    },
                ],
                website: "https://www.bridgecareaba.com/locations/utah",
                email: "info@bridgecareaba.com",
                cost: "N/A",
                insurance: [{ name: "Contact us" }],
                counties_served: [
                    {
                        county: "Iron, Utah, Davis, Weber"
                    }
                ],
                min_age: 2.0,
                max_age: 21.0,
                waitlist: "No",
                telehealth_services: "Yes",
                spanish_speakers: "No",
                at_home_services: null,
                in_clinic_services: null,
            },
        },
        {
            id: 5,
            type: "provider",
            attributes: {
                name: "Never Give Up Therapists",
                locations: [
                    {
                        name: "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        address_1: "6033 Fashion Point Dr",
                        address_2: null,
                        city: "South Ogden",
                        state: "UT",
                        zip: "84403",
                        phone: "801-435-8088",
                    },
                ],
                website: "https://www.bridgecareaba.com/locations/utah",
                email: "info@bridgecareaba.com",
                cost: "N/A",
                insurance: [
                    { 
                        name: "Contact us"
                    },
                    {
                        name: "Aetna"
                    },
                    {
                        name: "Regence (BCBS)"
                    },
                    {
                        name: "Cigna"
                    },
                    {
                        name: "Health Choice Utah"
                    },
                    {
                        name: "Healthy U Medicaid (University of Utah Health Plans)"
                    },
                    {
                        name: "United HealthCare (UHC)"
                    }
                ],
                counties_served: [
                    {
                        county: "Salt Lake, Davis, Weber"
                    }
                ],
                min_age: 2.0,
                max_age: 21.0,
                waitlist: "No",
                telehealth_services: "No",
                spanish_speakers: "No",
                at_home_services: null,
                in_clinic_services: null,
            },
        }
    ]
}


