interface ProviderAttributes {
    name: string;
    website: string;
    address: string;
    phone: string;
    email: string;
    insurance: string;
    locations_served: string;
    cost: string;
    ages_served: string;
    waitlist: string;
    telehealth_services: string;
    spanish_speakers: string;
}

interface MockProviders {
    data: {
        type: string;
        id: number;
        attributes: ProviderAttributes;
    }[];
}

export const mockProviders: MockProviders = {
    data: [
        {
            type: 'provider',
            id: 1,
            attributes: {
                name: 'A BridgeCare ABA',
                website: 'https://www.bridgecareaba.com/locations/utah',
                address: '1234 West Road Drive',
                phone: '(123) 456-7890',
                email: 'info@bridgecareaba.com',
                insurance: 'Insurance Company 1, Insurance Comapny 2',
                locations_served: 'Salt Lake, Utah, Davis, and Weber',
                cost: 'N/A',
                ages_served: '2-16 years',
                waitlist: 'None',
                telehealth_services: 'Yes',
                spanish_speakers: 'No',
            },
        },
        {
            type: 'provider',
            id: 2,
            attributes: {
                name: 'Above & Beyond Therapy',
                website: 'https://www.abtaba.com/locations/aba-therapy-in-utah',
                address: '311 Boulevard of The Americas, Suite 304 Lakewood, NJ 08701',
                phone: '(801) 610-2400',
                email: 'info@ababpa.com',
                insurance: 'Insurance Company 2, Insurance Company 3',
                locations_served: 'Utah, Salt Lake, Davis, and Tooele',
                cost: 'Out-of-Network and single-case agreements',
                ages_served: '2-21',
                waitlist: 'No waitlist',
                telehealth_services: 'Yes, if necessary',
                spanish_speakers: 'Yes',
            },
        },
        {
            type: 'provider',
            id: 3,
            attributes: {
                name: 'Autism Specialists',
                website: 'https://www.bridgecareaba.com/locations/utah',
                address: '1234 West Road Drive',
                phone: '(123) 456-7890',
                email: 'info@bridgecareaba.com',
                insurance: 'Insurance Company 3, Insurance Company 6',
                locations_served: 'Iron, Wayne, and Sanpete',
                cost: 'N/A',
                ages_served: '2-16 years',
                waitlist: 'None',
                telehealth_services: 'Yes',
                spanish_speakers: 'Yes',
            },
        },
        {
            type: 'provider',
            id: 4,
            attributes: {
                name: 'Behavioral Child Psychologists',
                website: 'https://www.bridgecareaba.com/locations/utah',
                address: '311 Boulevard of The Americas, Suite 304 Lakewood, NJ 08701',
                phone: '(123) 456-7890',
                email: 'info@bridgecareaba.com',
                insurance: 'Insurance Company 2, Insurance Company 5',
                locations_served: 'Iron, Utah, Davis, Tooele, and Weber',
                cost: 'N/A',
                ages_served: '2-16 years',
                waitlist: 'None',
                telehealth_services: 'Yes',
                spanish_speakers: 'Yes',
            },
        },
        {
            type: 'provider',
            id: 5,
            attributes: {
                name: 'Never Give Up Therapists',
                website: 'https://www.bridgecareaba.com/locations/utah',
                address: '311 Boulevard of The Americas, Suite 304 Lakewood, NJ 08701',
                phone: '(123) 456-7890',
                email: 'info@bridgecareaba.com',
                insurance: 'Insurance Company 2, Insurance Company 5, Insurance Company 1',
                locations_served: 'Iron, Utah, Davis, Salt Lake, and Weber',
                cost: 'N/A',
                ages_served: '2-16 years',
                waitlist: 'None',
                telehealth_services: 'Yes',
                spanish_speakers: 'No',
            },
        },
        {
            type: 'provider',
            id: 6,
            attributes: {
                name: 'Utah Childhood Psychology',
                website: 'https://www.bridgecareaba.com/locations/utah',
                address: '1234 West Road Drive',
                phone: '(123) 456-7890',
                email: 'info@bridgecareaba.com',
                insurance: 'Insurance Company 3, Insurance Company 6',
                locations_served: 'Iron, Wayne, and Sanpete',
                cost: 'N/A',
                ages_served: '2-16 years',
                waitlist: 'None',
                telehealth_services: 'Yes',
                spanish_speakers: 'Yes',
            },
        }
    ],
};

export type { ProviderAttributes, MockProviders };
