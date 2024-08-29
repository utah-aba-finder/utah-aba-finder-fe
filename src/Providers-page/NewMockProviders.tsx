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
    counties_served: CountiesServed[];
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
    "data": [
        {
            "id": 1,
            "type": "provider",
            "attributes": {
                "name": "A BridgeCare ABA",
                "locations": [
                    {
                        "name": "https://www.bridgecareaba.com/locations/aba-therapy-in-utah",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "801-435-8088"
                    }
                ],
                "website": "https://www.bridgecareaba.com/locations/utah",
                "email": "info@bridgecareaba.com",
                "cost": "N/A",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah, Davis, Weber"
                    }
                ],
                "min_age": 2.0,
                "max_age": 16.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 2,
            "type": "provider",
            "attributes": {
                "name": "Above & Beyond Therapy",
                "locations": [
                    {
                        "name": "https://www.abtaba.com/locations/aba-therapy-in-utah",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 630-2040"
                    }
                ],
                "website": "https://www.abtaba.com/",
                "email": "info@abtaba.com",
                "cost": "Out-of-Network and single-case agreements.",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Salt Lake, Davis, Logan to Spanish Fork, Tooele"
                    }
                ],
                "min_age": 2.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 3,
            "type": "provider",
            "attributes": {
                "name": "ABA Pediatric Autism Services",
                "locations": [
                    {
                        "name": "https://www.abapediatricautismservices.com/locations",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 762-8342"
                    }
                ],
                "website": "www.abapediatricautismservices.com",
                "email": "info@abapediatricautismservices.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Davis, Salt Lake, Weber"
                    }
                ],
                "min_age": 1.5,
                "max_age": 6.0,
                "waitlist": "No",
                "telehealth_services": "limited",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 4,
            "type": "provider",
            "attributes": {
                "name": "ABA with Iris",
                "locations": [
                    {
                        "name": "https://www.abawithiris.com/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 979-1326"
                    }
                ],
                "website": "www.abawithiris.com",
                "email": "abawithiris@gmail.com",
                "cost": "Private pay available",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "TRICARE"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Bountiful, Lehi"
                    }
                ],
                "min_age": 5.0,
                "max_age": 45.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 5,
            "type": "provider",
            "attributes": {
                "name": "Affinity Autism Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1970 W 7800 S",
                        "address_2": null,
                        "city": "West Jordan",
                        "state": "UT",
                        "zip": "84088",
                        "phone": "(801) 506-6695"
                    }
                ],
                "website": "www.affinityautism.com",
                "email": "Affinity@affinitytreatment.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Meritain (Aetna)"
                    },
                    {
                        "name": "Anthem (BCBS)"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Compsych"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "MotivHealth"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "UMR (UHC)"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    },
                    {
                        "name": "Utah’s Children’s Health Insurance Program (CHIP)"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Salt Lake, Iron, Davis, Weber"
                    }
                ],
                "min_age": 1.5,
                "max_age": 21.0,
                "waitlist": "12 months",
                "telehealth_services": "limited",
                "spanish_speakers": "limited",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 6,
            "type": "provider",
            "attributes": {
                "name": "A.B.I. Learning Center",
                "locations": [
                    {
                        "name": null,
                        "address_1": "12637 S 265 W",
                        "address_2": "Suite 300",
                        "city": "Draper",
                        "state": "UT",
                        "zip": "84020",
                        "phone": "(801) 998-8428"
                    }
                ],
                "website": "www.abilearningcenter.com",
                "email": "Office@abilearningcenter.com",
                "cost": "Bill insurance or private pay is $50 an hour for RBT, BCaBA, and BCBA",
                "insurance": [
                    {
                        "name": "Administrator Benefits"
                    },
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Meritain (Aetna)"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Tall Tree"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Salt Lake, Davis"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "24 months",
                "telehealth_services": "limited",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 7,
            "type": "provider",
            "attributes": {
                "name": "Achieving Abilities LLC",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1392 West Turf Farm Way",
                        "address_2": "Suite 1-153",
                        "city": "Payson",
                        "state": "UT",
                        "zip": "84651",
                        "phone": "(801) 935-5796"
                    }
                ],
                "website": "www.achievingabilities.com",
                "email": "info@achievingabilities.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Beacon Health"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Cache"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "Contact provider",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 8,
            "type": "provider",
            "attributes": {
                "name": "ABS Kids",
                "locations": [
                    {
                        "name": "Salt Lake County",
                        "address_1": "515 S 700 E",
                        "address_2": "#2A",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84102",
                        "phone": "(801) 935-4171"
                    },
                    {
                        "name": "Utah County Office",
                        "address_1": "1140 W 1130 S",
                        "address_2": "Building B",
                        "city": "Orem",
                        "state": "UT",
                        "zip": "84058",
                        "phone": "(800) 434-8923"
                    },
                    {
                        "name": "Davis County Office",
                        "address_1": "2940 Church St",
                        "address_2": "Suite #303",
                        "city": "Layton",
                        "state": "UT",
                        "zip": "84040",
                        "phone": "(800) 434-8923"
                    }
                ],
                "website": "www.abskids.com",
                "email": "info@alternativebehaviorstrategies.com",
                "cost": "Intake and assessment $480 (6hrs. $80hr.)\r\n RBT $380 weekly (1hr supervised\r\n $80 + 30 hrs. at\r\n $30hr direct care)",
                "insurance": [
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Bountiful, Lehi, Tooele, Richfield"
                    }
                ],
                "min_age": 1.5,
                "max_age": null,
                "waitlist": "8 months",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": "Yes",
                "in_clinic_services": null
            }
        },
        {
            "id": 9,
            "type": "provider",
            "attributes": {
                "name": "ACES ABA",
                "locations": [
                    {
                        "name": null,
                        "address_1": "222 Main St",
                        "address_2": "Suite 500",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84101",
                        "phone": "1-855-223-7123"
                    }
                ],
                "website": "www.acesaba.com/location-salt-lake-city/",
                "email": "verifications@acesaba.com",
                "cost": "Varies based on child needs and location.",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake City & surrounding areas"
                    }
                ],
                "min_age": 0.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 10,
            "type": "provider",
            "attributes": {
                "name": "A.G.E.S. Learning Solutions",
                "locations": [
                    {
                        "name": null,
                        "address_1": "7103 S Redwood Road",
                        "address_2": "Suite 235",
                        "city": "West Jordan",
                        "state": "UT",
                        "zip": "84084",
                        "phone": "1-866-375-2437"
                    }
                ],
                "website": "www.ageslearningsolutions.com",
                "email": "emmylou@ageslearningsolutions.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake City & surrounding areas"
                    }
                ],
                "min_age": 1.5,
                "max_age": 21.0,
                "waitlist": "In-clinic no waitlist for daytime (9AM-3PM);\r\n 60+ days for after school (3PM - 6PM);\r\n In-home 60+ days (SLC\r\n County",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 11,
            "type": "provider",
            "attributes": {
                "name": "Advanced Behavior Analysis, Inc",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1441 E Fort Union Blvd",
                        "address_2": null,
                        "city": "Cottonwood Heights",
                        "state": "UT",
                        "zip": "84121",
                        "phone": "(385) 695-2203"
                    }
                ],
                "website": "https://anybehavior.com/",
                "email": null,
                "cost": "Pricing may vary depending on the child's needs.\r\n Private pay: Supervised $80 per hour\r\n RBT $32 per hour Every 10 hours of RBT requires one hour of supervised.",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "Tall Tree"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Summit, Wasatch, Utah"
                    }
                ],
                "min_age": 2.0,
                "max_age": 14.0,
                "waitlist": "No",
                "telehealth_services": "No",
                "spanish_speakers": "limited",
                "at_home_services": "Yes",
                "in_clinic_services": null
            }
        },
        {
            "id": 12,
            "type": "provider",
            "attributes": {
                "name": "Advanced Behavior Change",
                "locations": [
                    {
                        "name": null,
                        "address_1": "352 South Denver St.",
                        "address_2": "Suite 202",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84111",
                        "phone": "(801) 251-6219"
                    }
                ],
                "website": "http://www.advancedbehaviorchange.com/",
                "email": "onlydiane@advancedbehaviorchange.com",
                "cost": "Private pay with support for submitting to your insurance",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake"
                    }
                ],
                "min_age": 7.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 13,
            "type": "provider",
            "attributes": {
                "name": "Apex Behavior Consulting",
                "locations": [
                    {
                        "name": "Salt Lake",
                        "address_1": "3006 South Highland Dr.",
                        "address_2": "#210",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84106",
                        "phone": "(801) 674-5352"
                    },
                    {
                        "name": "Ogden ",
                        "address_1": "3670 Quincy Ave",
                        "address_2": "#210",
                        "city": "Ogden",
                        "state": "UT",
                        "zip": "84403",
                        "phone": "(801) 674-5352"
                    }
                ],
                "website": "http://www.apexbehavior.com",
                "email": "clientservices@apexbehavior.com",
                "cost": "Bill insurance or private pay behavior technician\r\n $50-$80 per hour, ABA program supervision $125 per hour, behavior consultation\r\n $100 per hour.",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Davis, Weber "
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": "0-3 months for\r\n 9AM - 3PM\r\n 18-24\r\n months for 3:30PM-6:\r\n 30PM.",
                "telehealth_services": "limited",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 14,
            "type": "provider",
            "attributes": {
                "name": "AIM-Autism in Motion",
                "locations": [
                    {
                        "name": null,
                        "address_1": "2811 N 2350 W",
                        "address_2": "Farr West",
                        "city": null,
                        "state": "UT",
                        "zip": "84404",
                        "phone": "801-452-1940"
                    }
                ],
                "website": "http://aim-autisminmotion.com/",
                "email": "gennie.tucker@aim-autisminmotion.com",
                "cost": "Bill insurance and private pay available",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Davis, Weber, Utah"
                    }
                ],
                "min_age": 1.5,
                "max_age": 22.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 15,
            "type": "provider",
            "attributes": {
                "name": "Autism Solutions",
                "locations": [
                    {
                        "name": "Layton",
                        "address_1": "1848 N Hill Field Rd",
                        "address_2": "#101 A",
                        "city": "Layton",
                        "state": "UT",
                        "zip": "84041",
                        "phone": "(801) 735-3252"
                    },
                    {
                        "name": "Draper",
                        "address_1": "12222 S. 1000 E.",
                        "address_2": "Suite 4",
                        "city": "Draper",
                        "state": "UT",
                        "zip": "84020",
                        "phone": null
                    }
                ],
                "website": "http://autismsolutionsutah.com",
                "email": "info@autismsolutionsutah.com",
                "cost": "ABA $125 per hour (BCBA)",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Davis, Utah"
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": "12 months",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 16,
            "type": "provider",
            "attributes": {
                "name": "Autism Therapy Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": "230 N 1680 E",
                        "address_2": "Building U",
                        "city": "St. George",
                        "state": "UT",
                        "zip": "84790",
                        "phone": "(435) 313-4571"
                    }
                ],
                "website": "http://www.autismtherapyservices.com/",
                "email": "info@autismtherapyservices.com",
                "cost": "Contact Provider",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "MotivHealth"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United Behavioral Health (UBH)"
                    },
                    {
                        "name": "Utah’s Children’s Health Insurance Program (CHIP)"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "St. George area, Cedar City"
                    }
                ],
                "min_age": 0.0,
                "max_age": 8.0,
                "waitlist": "Contact Provider",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 17,
            "type": "provider",
            "attributes": {
                "name": "Balance Family Solutions",
                "locations": [
                    {
                        "name": null,
                        "address_1": "744 E 400 S",
                        "address_2": "Suite B",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84102",
                        "phone": "(801) 477-5177"
                    }
                ],
                "website": "balancefamilysolutions.org",
                "email": "info@balancefamilysolutions.org",
                "cost": "Bill insurance and private pay available",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake "
                    }
                ],
                "min_age": 2.0,
                "max_age": 16.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 18,
            "type": "provider",
            "attributes": {
                "name": "Bee Kids Utah",
                "locations": [
                    {
                        "name": null,
                        "address_1": "88 East 1000 North",
                        "address_2": "Suite 200",
                        "city": "Tooele",
                        "state": "UT",
                        "zip": "84074",
                        "phone": "(435) 233-6030"
                    }
                ],
                "website": "https://www.beekidsutah.com/",
                "email": "admin@beekidsutah.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Tooele"
                    }
                ],
                "min_age": 2.0,
                "max_age": 16.0,
                "waitlist": null,
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 19,
            "type": "provider",
            "attributes": {
                "name": "Beehive Behavior Services",
                "locations": [
                    {
                        "name": "www.beehivebehaviorservices.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(435) 213-5383"
                    }
                ],
                "website": "www.beehivebehaviorservices.com",
                "email": "admin@buzzaba.com",
                "cost": "Contact Provider",
                "insurance": [
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Cache, Box Elder, Weber, Davis, Salt Lake, Utah"
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "limited",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 20,
            "type": "provider",
            "attributes": {
                "name": "Behavior and Learning Strategies, Inc.",
                "locations": [
                    {
                        "name": "https://behaviorlearning.hi5aba.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 500-4248"
                    }
                ],
                "website": "https://behaviorlearning.hi5aba.com",
                "email": "Joe.dixon@hi5aba.com",
                "cost": "Based on need",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Anthem (BCBS)"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Uintah, Duchesne, Price, Emery, Sanpete, Wayne, Utah"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "1 month",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 21,
            "type": "provider",
            "attributes": {
                "name": "Blue Autism Center",
                "locations": [
                    {
                        "name": null,
                        "address_1": "2540 East Bengal Blvd",
                        "address_2": "suite 300",
                        "city": "Cottonwood Heights",
                        "state": "UT",
                        "zip": "84121",
                        "phone": "(801) 495-5105"
                    }
                ],
                "website": "https://www.blueautism.com/",
                "email": null,
                "cost": "Contact office",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Select Health"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Cottonwood Heights"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 22,
            "type": "provider",
            "attributes": {
                "name": "ABA Blue Gems Therapy",
                "locations": [
                    {
                        "name": "https://bluegemsaba.com/aba-therapy-in-utah/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 466-2573"
                    }
                ],
                "website": "https://bluegemsaba.com/aba-therapy-in-utah/",
                "email": "info@bluegemsaba.com",
                "cost": "Contact us for any questions regarding coverage or plans in Utah.",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Health Choice Utah"
                    },
                    {
                        "name": "Healthy U Medicaid (University of Utah Health Plans)"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Sandy, Draper, Cottonwood Heights, South Jordan, Smithfield, Plymouth, West Jordan"
                    }
                ],
                "min_age": 2.0,
                "max_age": 15.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 23,
            "type": "provider",
            "attributes": {
                "name": "Brighter Strides ABA",
                "locations": [
                    {
                        "name": "https://bluegemsaba.com/aba-therapy-in-utah/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 720-2996"
                    }
                ],
                "website": "brighterstridesaba.com",
                "email": "info@brighterstridesaba.com",
                "cost": "Scaled",
                "insurance": [
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "State of Utah"
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 24,
            "type": "provider",
            "attributes": {
                "name": "Buddies Behavioral Services, LLC",
                "locations": [
                    {
                        "name": "https://bluegemsaba.com/aba-therapy-in-utah/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(385) 266-5328"
                    }
                ],
                "website": "https://buddiesbehavior.com/",
                "email": "admin@buddiesbehavior.com",
                "cost": "Contact office",
                "insurance": [
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Box Elder, Davis, Weber"
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 25,
            "type": "provider",
            "attributes": {
                "name": "Catalyst Behavior Solutions",
                "locations": [
                    {
                        "name": "South Ogden",
                        "address_1": "6033 Fashion Point Dr",
                        "address_2": null,
                        "city": "South Ogden",
                        "state": "UT",
                        "zip": "84403",
                        "phone": "1-866-569-7395"
                    },
                    {
                        "name": "Farmington",
                        "address_1": "1438 N Hwy 89",
                        "address_2": "Suite 130",
                        "city": "Farmington",
                        "state": "UT",
                        "zip": "84025",
                        "phone": null
                    }
                ],
                "website": "https://catalystbehavior.com/",
                "email": null,
                "cost": "Discount offered for prepaying services\r\n RBT $80, $64 with prepay discount. BCaBA/student\r\n $100, $80 with prepay discount BCBA $150, $120\r\n with prepay\r\n discount.",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Davis, Weber, Morgan"
                    }
                ],
                "min_age": 2.0,
                "max_age": 21.0,
                "waitlist": "Availability for daytime hours for kids ages 2-\r\n 6, after school services typically several months",
                "telehealth_services": "Yes",
                "spanish_speakers": "limited",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 26,
            "type": "provider",
            "attributes": {
                "name": "ABA Cedar Tree",
                "locations": [
                    {
                        "name": "https://cedartreeaba.com/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 810-2896"
                    }
                ],
                "website": "https://cedartreeaba.com/",
                "email": "info@cedartreeaba.com",
                "cost": "Out of network",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Health Choice Utah"
                    },
                    {
                        "name": "Healthy U Medicaid (University of Utah Health Plans)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Molina"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Cache, Davis, Weber, Salt Lake, Washington, Utah"
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 27,
            "type": "provider",
            "attributes": {
                "name": "Chrysalis",
                "locations": [
                    {
                        "name": "http://www.gochrysalis.com/contact",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": null
                    }
                ],
                "website": "https://www.chrysalis.care/autism",
                "email": "autismservices@gochrysalis.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Locations along 1-15 Including St. George"
                    }
                ],
                "min_age": null,
                "max_age": 21.0,
                "waitlist": "Contact provider",
                "telehealth_services": "Yes",
                "spanish_speakers": "limited",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 28,
            "type": "provider",
            "attributes": {
                "name": "Continuum Behavioral Health",
                "locations": [
                    {
                        "name": "http://www.behavioralhealthservices.net/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "1-800-828-5659"
                    }
                ],
                "website": "http://www.behavioralhealthservices.net/",
                "email": "contact@autismspectrumalliance.com",
                "cost": "Varies based on needs",
                "insurance": [
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Compsych"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United Behavioral Health (UBH)"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Weber, Summit, Salt Lake, Davis, Morgan"
                    }
                ],
                "min_age": 0.5,
                "max_age": null,
                "waitlist": null,
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 29,
            "type": "provider",
            "attributes": {
                "name": "Crimson Counseling",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1240 E 100 S",
                        "address_2": "Building 7",
                        "city": "St. George",
                        "state": "UT",
                        "zip": "84780",
                        "phone": "(801) 872-3489"
                    }
                ],
                "website": "https://crimsonheightsbh.com/",
                "email": "admin@crimsoncounseling.net",
                "cost": null,
                "insurance": [
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "FSA"
                    },
                    {
                        "name": "HSA"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United Behavioral Health (UBH)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "St. George and surrounding Washington"
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 30,
            "type": "provider",
            "attributes": {
                "name": "Discovery ABA",
                "locations": [
                    {
                        "name": null,
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(385) 354-5250"
                    }
                ],
                "website": "www.discoveryaba.com",
                "email": "info@discoveryaba.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "TRICARE"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah, Weber, Davis, Cache "
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 31,
            "type": "provider",
            "attributes": {
                "name": "Elevation Behavioral Science Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "801-923-3537"
                    }
                ],
                "website": "https://www.elevationbx.com/",
                "email": "services@elevationbx.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "Daytime (8:\r\n 30 AM - 2:30 PM) No\r\n waitlist; After school hours ~6 months",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 32,
            "type": "provider",
            "attributes": {
                "name": "Eaton Alliance",
                "locations": [
                    {
                        "name": "Utah County",
                        "address_1": "281 S Vineyard Rd",
                        "address_2": "Ste 103",
                        "city": "Orem",
                        "state": "UT",
                        "zip": "84058",
                        "phone": "(801) 768-0608"
                    },
                    {
                        "name": "Salt Lake County",
                        "address_1": "825 N 300 W",
                        "address_2": "Ste W107",
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84103",
                        "phone": null
                    }
                ],
                "website": "http://eatonalliance.com",
                "email": null,
                "cost": null,
                "insurance": [
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah"
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 33,
            "type": "provider",
            "attributes": {
                "name": "Fabian House",
                "locations": [
                    {
                        "name": "www.fabianhouse.com",
                        "address_1": "3118 N 1200 W",
                        "address_2": null,
                        "city": "Lehi",
                        "state": "UT",
                        "zip": "84043",
                        "phone": "(801) 917-0940"
                    }
                ],
                "website": "www.fabianhouse.com",
                "email": "info@fabianhouse.com",
                "cost": "Private pay accepted",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utahand Surrounding Areas"
                    }
                ],
                "min_age": 2.0,
                "max_age": 8.0,
                "waitlist": "Contact provider",
                "telehealth_services": "No",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 34,
            "type": "provider",
            "attributes": {
                "name": "ABA Golden Steps UT, LLC",
                "locations": [
                    {
                        "name": "www.goldenstepsaba.com/utah",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 653-3111"
                    }
                ],
                "website": "www.goldenstepsaba.com/utah",
                "email": "info@goldenstepsaba.com",
                "cost": "N/A",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake City, Sandy, Orem, West Jordan, Provo, Bountiful, Ogden, Tooele"
                    }
                ],
                "min_age": 0.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 35,
            "type": "provider",
            "attributes": {
                "name": "Golden Touch ABA",
                "locations": [
                    {
                        "name": "www.goldentouchaba.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 630-5443"
                    }
                ],
                "website": "www.goldentouchaba.com",
                "email": "info@goldentouchaba.com",
                "cost": "Out of network benefits and single case agreements",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah, Wasatch, Weber "
                    }
                ],
                "min_age": 1.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 36,
            "type": "provider",
            "attributes": {
                "name": "Honey Beehavior Analysis",
                "locations": [
                    {
                        "name": "www.honeyaba.org",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 317-8225"
                    }
                ],
                "website": "www.honeyaba.org",
                "email": "tricia.hayner@honeyaba.org",
                "cost": "Private pay accepted",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Iron, Statewide via telehealth"
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "Contact provider",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 37,
            "type": "provider",
            "attributes": {
                "name": "Integrated Autism Therapies",
                "locations": [
                    {
                        "name": null,
                        "address_1": "7733 S Redwood Road",
                        "address_2": null,
                        "city": "West Jordan",
                        "state": "UT",
                        "zip": "84084",
                        "phone": "(801) 885-1700"
                    }
                ],
                "website": "https://www.iatutah.com/",
                "email": "barb@iatutah.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Molina"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake"
                    }
                ],
                "min_age": null,
                "max_age": null,
                "waitlist": null,
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 38,
            "type": "provider",
            "attributes": {
                "name": "Just Parent",
                "locations": [
                    {
                        "name": "www.justparent.com/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(385) 376-3787"
                    }
                ],
                "website": "www.justparent.com/",
                "email": null,
                "cost": "$99/month",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Magellan"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Statewide via telemedicine"
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "Please call",
                "telehealth_services": "Yes",
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 39,
            "type": "provider",
            "attributes": {
                "name": "Kids On The Move",
                "locations": [
                    {
                        "name": null,
                        "address_1": "475 West 260 North",
                        "address_2": null,
                        "city": "Orem",
                        "state": "UT",
                        "zip": "84057",
                        "phone": "(385) 292-5633"
                    }
                ],
                "website": "kotm.org",
                "email": "autismintake@kotm.org",
                "cost": "Private pay available",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Clinic in Orem, Utah; In-home services available in Utah"
                    }
                ],
                "min_age": 0.0,
                "max_age": 17.0,
                "waitlist": "Please call",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 40,
            "type": "provider",
            "attributes": {
                "name": "Kyo Autism Therapy",
                "locations": [
                    {
                        "name": null,
                        "address_1": "9980 S 300 W",
                        "address_2": null,
                        "city": "Sandy",
                        "state": "UT",
                        "zip": "94070",
                        "phone": "1-877-264-6747"
                    }
                ],
                "website": "https://kyocare.com",
                "email": "info@kyocare.com",
                "cost": "Private pay accepted",
                "insurance": [
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Davis, Salt Lake, Utah, Summit, Weber, Morgan"
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 41,
            "type": "provider",
            "attributes": {
                "name": "Learning Solutions LLC",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1360 W Highway 40",
                        "address_2": "STE B",
                        "city": "Vernal",
                        "state": "UT",
                        "zip": "84078",
                        "phone": "(435) 789-5683"
                    }
                ],
                "website": "https://www.learningsolutionsinc.org/",
                "email": "Madilyn.Bernard@learningsolutionsinc.org",
                "cost": "Private pay available",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Uintah Basin and Tri-  area"
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "6 months",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 42,
            "type": "provider",
            "attributes": {
                "name": "Lexington Services",
                "locations": [
                    {
                        "name": "www.lexingtonservices.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "801-980-7970"
                    }
                ],
                "website": "www.lexingtonservices.com",
                "email": "utahinfo@lexingtonservices.com",
                "cost": "Private pay available",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "Evernorth (Cigna)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah, Davis, Weber "
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 43,
            "type": "provider",
            "attributes": {
                "name": "Lighthouse Youth & Family Therapy",
                "locations": [
                    {
                        "name": null,
                        "address_1": "365 W 50 N",
                        "address_2": "Suite W8",
                        "city": "Vernal",
                        "state": "UT",
                        "zip": "84078",
                        "phone": "(435)790-2757"
                    }
                ],
                "website": "www.lighthouseyouthandfamily.com",
                "email": "lbretorr.aba@gmail.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Uintah, Duchesne "
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "No",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 44,
            "type": "provider",
            "attributes": {
                "name": "Manning Behavior Services",
                "locations": [
                    {
                        "name": "www.manningbehaviorservices.com/",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 548-3091"
                    }
                ],
                "website": "www.manningbehaviorservices.com/",
                "email": "christine@manningbehaviorservices.com",
                "cost": "$75 per hour",
                "insurance": [
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Davis, Weber "
                    }
                ],
                "min_age": 2.0,
                "max_age": 25.0,
                "waitlist": "Daytime no waitlist; After school hours contact provider",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 45,
            "type": "provider",
            "attributes": {
                "name": "Mendability Sensory Enrichment Therapy",
                "locations": [
                    {
                        "name": null,
                        "address_1": "915 South 500 East",
                        "address_2": "Ste 101",
                        "city": "American Fork",
                        "state": "UT",
                        "zip": "84003",
                        "phone": "1-888-579-7002"
                    }
                ],
                "website": "www.mendability.com",
                "email": null,
                "cost": "$3 per day\r\n 15 mins per day",
                "insurance": [
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Davis, Weber "
                    }
                ],
                "min_age": 0.0,
                "max_age": null,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 46,
            "type": "provider",
            "attributes": {
                "name": "Neurobehavioral Center for Growth",
                "locations": [
                    {
                        "name": "Bountiful",
                        "address_1": "415 S. Medical Drive",
                        "address_2": "Suite D101",
                        "city": "Bountiful",
                        "state": "UT",
                        "zip": "84010",
                        "phone": "(801) 683-1062"
                    },
                    {
                        "name": "Layton",
                        "address_1": "327 W. Gordon Ave.",
                        "address_2": "Suite 2",
                        "city": "Layton",
                        "state": "UT",
                        "zip": "84041",
                        "phone": "(801) 683-1063"
                    }
                ],
                "website": "http://www.neurobcg.com/",
                "email": "admin@neurobcg.com",
                "cost": "Neuro BCG offers a \"tier\" program for clients that don't qualify for in home ABA.",
                "insurance": [
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "TRICARE"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Bountiful, Layton, Salt Lake City and South Ogden"
                    }
                ],
                "min_age": 3.0,
                "max_age": 9.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 47,
            "type": "provider",
            "attributes": {
                "name": "PBJ & Friends - Behavioral Health Center For Children With Autism",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1305 Commerce Dr",
                        "address_2": "Suite 120",
                        "city": "Saratoga Springs",
                        "state": "UT",
                        "zip": "84045",
                        "phone": "(801) 997-6839"
                    }
                ],
                "website": "https://pbjandfriends.com/ ",
                "email": null,
                "cost": "Contact provider",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Molina"
                    },
                    {
                        "name": "MotivHealth"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "TRICARE"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    },
                    {
                        "name": "Wise Imagine"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah"
                    }
                ],
                "min_age": 1.0,
                "max_age": 18.0,
                "waitlist": "2 months waitlist for evenings.\r\n No waitlist for the morning and afternoon schedule.",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 48,
            "type": "provider",
            "attributes": {
                "name": "Perfect Piece",
                "locations": [
                    {
                        "name": null,
                        "address_1": "9980 S 300 W",
                        "address_2": "Ste 200",
                        "city": "Sandy",
                        "state": "UT",
                        "zip": "84070",
                        "phone": "(508) 733-7279"
                    }
                ],
                "website": "www.PerfectPiece.org",
                "email": "Lauren@PerfectPiece.org",
                "cost": null,
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Northern Utah"
                    }
                ],
                "min_age": 2.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 49,
            "type": "provider",
            "attributes": {
                "name": "Pingree Autism Center",
                "locations": [
                    {
                        "name": null,
                        "address_1": "780 South Guardsman Way",
                        "address_2": null,
                        "city": "Salt Lake City",
                        "state": "UT",
                        "zip": "84108",
                        "phone": "(801) 581-0194"
                    }
                ],
                "website": "www.carmenbpingree.com",
                "email": null,
                "cost": null,
                "insurance": [
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake City"
                    }
                ],
                "min_age": 3.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 50,
            "type": "provider",
            "attributes": {
                "name": "ABA Skill Builders",
                "locations": [
                    {
                        "name": null,
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801)448-6195"
                    }
                ],
                "website": "www.skillbuildersaba.com",
                "email": "info@skillbuildersaba.com",
                "cost": "N/A",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Salt Lake, Utah, Davis "
                    }
                ],
                "min_age": 0.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 51,
            "type": "provider",
            "attributes": {
                "name": "Success on the Spectrum",
                "locations": [
                    {
                        "name": null,
                        "address_1": "36 N 1100 E",
                        "address_2": "Suite B.",
                        "city": "American Fork",
                        "state": "UT",
                        "zip": "84003",
                        "phone": "(385) 486-4190"
                    }
                ],
                "website": "www.successonthespectrum.com",
                "email": "americanfork@successonthespectrum.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "EMI Health"
                    },
                    {
                        "name": "Evernorth (Cigna)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah"
                    }
                ],
                "min_age": 1.5,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 52,
            "type": "provider",
            "attributes": {
                "name": "Summit Behavior Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": "162 N 400 E",
                        "address_2": "Suite A105",
                        "city": "St. George",
                        "state": "UT",
                        "zip": "84770",
                        "phone": "(435) 275-8911"
                    }
                ],
                "website": "www.summitbehaviorservicesutah.weebly.com",
                "email": null,
                "cost": "RBT - 1 hour $35 BCBA - 30\r\n minutes $40",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "St. George services include 50% in- home/clinical services, Cedar City includes 100% in- home"
                    }
                ],
                "min_age": 3.0,
                "max_age": 18.0,
                "waitlist": null,
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": "Yes",
                "in_clinic_services": null
            }
        },
        {
            "id": 53,
            "type": "provider",
            "attributes": {
                "name": "Radiant Behavior Solutions - Art-Based & Neurodiversity Affirming",
                "locations": [
                    {
                        "name": "www.radiantbehavior.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": null
                    }
                ],
                "website": "www.radiantbehavior.com",
                "email": "info@radiantbehavior.com",
                "cost": "Private Pay Available",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Salt Lake, Davis, Cache, Box Elder "
                    }
                ],
                "min_age": 2.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 54,
            "type": "provider",
            "attributes": {
                "name": "Re Therapy Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": "727 South Main Street",
                        "address_2": null,
                        "city": "Spanish Fork",
                        "state": "UT",
                        "zip": "84660",
                        "phone": "(801) 210-9319"
                    }
                ],
                "website": "http://www.retherapyservices.com/",
                "email": null,
                "cost": null,
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Regence (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Molina"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah, Nephi, Delta"
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 55,
            "type": "provider",
            "attributes": {
                "name": "Reaching Milestones",
                "locations": [
                    {
                        "name": null,
                        "address_1": "365 W 1550 N",
                        "address_2": null,
                        "city": "Layton",
                        "state": "UT",
                        "zip": "84041",
                        "phone": "(678) 656-4716"
                    }
                ],
                "website": "www.reachingmilestones.com",
                "email": null,
                "cost": null,
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Contact us"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Layton area"
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": null,
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 56,
            "type": "provider",
            "attributes": {
                "name": "Rogue Behavior Services",
                "locations": [
                    {
                        "name": null,
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(385) 321-7880"
                    }
                ],
                "website": "https://roguebehaviorservices.com/",
                "email": "info@roguebx.com",
                "cost": "Pay rates: Available upon request",
                "insurance": [
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Cache, Box Elder, Weber, Davis, Salt Lake, Utah, Iron "
                    }
                ],
                "min_age": 0.0,
                "max_age": 17.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "limited",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 57,
            "type": "provider",
            "attributes": {
                "name": "Transitional Behavior Support",
                "locations": [
                    {
                        "name": null,
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(385) 245-2555"
                    }
                ],
                "website": "www.transitionalbehaviorsupport.com",
                "email": "leslielilino@transitionalbehaviorsupport.com",
                "cost": "Pay Rates: Available upon request",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "Utah Services for People with Disabilities (DSPD)"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah: Orem, Provo, Lehi, Summit : Heber, Midway and telehealth"
                    }
                ],
                "min_age": 3.0,
                "max_age": 65.0,
                "waitlist": "No",
                "telehealth_services": "Yes",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 58,
            "type": "provider",
            "attributes": {
                "name": "Utah Autism Academy",
                "locations": [
                    {
                        "name": "Midvale",
                        "address_1": "7434 S. State Street",
                        "address_2": null,
                        "city": "Midvale",
                        "state": "UT",
                        "zip": "84047",
                        "phone": "(801) 456-9955 "
                    },
                    {
                        "name": "Orem",
                        "address_1": "1875 S. Geneva Road",
                        "address_2": null,
                        "city": "Orem",
                        "state": "UT",
                        "zip": "84058",
                        "phone": "(801) 437-0490"
                    },
                    {
                        "name": "St. George",
                        "address_1": "1680 East 230 North",
                        "address_2": null,
                        "city": "St. George",
                        "state": "UT",
                        "zip": "84790",
                        "phone": null
                    }
                ],
                "website": "http://utahautismacademy.com",
                "email": null,
                "cost": "Varies based on hours and patient needs.",
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Midvale, Orem, St. George"
                    }
                ],
                "min_age": 2.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 59,
            "type": "provider",
            "attributes": {
                "name": "Utah Behavior Services",
                "locations": [
                    {
                        "name": "http://utahbehaviorservices.com",
                        "address_1": null,
                        "address_2": null,
                        "city": null,
                        "state": null,
                        "zip": null,
                        "phone": "(801) 255-5131"
                    }
                ],
                "website": "http://utahbehaviorservices.com",
                "email": "office@utbs.com",
                "cost": null,
                "insurance": [
                    {
                        "name": "Contact us"
                    },
                    {
                        "name": "Medicaid"
                    }
                ],
                "counties_served": [
                    {
                        "county": "SLC, Brigham City, Bear River, Richfield, Riverdale (Ogden), Lehi, Cedar City, St. George"
                    }
                ],
                "min_age": 0.0,
                "max_age": 21.0,
                "waitlist": "No",
                "telehealth_services": null,
                "spanish_speakers": "Yes",
                "at_home_services": null,
                "in_clinic_services": null
            }
        },
        {
            "id": 60,
            "type": "provider",
            "attributes": {
                "name": "Whole Child Therapy",
                "locations": [
                    {
                        "name": null,
                        "address_1": "1570 North Main Street",
                        "address_2": null,
                        "city": "Spanish Fork",
                        "state": "UT",
                        "zip": "84660",
                        "phone": "(801) 210-9319"
                    }
                ],
                "website": "www.thewholechildtherapy.com/",
                "email": "contactus@twctherapy.com",
                "cost": "Private pay rates available upon request",
                "insurance": [
                    {
                        "name": "Aetna"
                    },
                    {
                        "name": "Blue Cross Blue Shield (BCBS)"
                    },
                    {
                        "name": "Cigna"
                    },
                    {
                        "name": "Deseret Mutual Benefit Administrators (DMBA)"
                    },
                    {
                        "name": "Medicaid"
                    },
                    {
                        "name": "Molina"
                    },
                    {
                        "name": "Optum (UnitedHealth Group)"
                    },
                    {
                        "name": "PEHP (Public Employees Health Program)"
                    },
                    {
                        "name": "Select Health"
                    },
                    {
                        "name": "UMR (UHC)"
                    },
                    {
                        "name": "United HealthCare (UHC)"
                    },
                    {
                        "name": "University of Utah Health Plans"
                    }
                ],
                "counties_served": [
                    {
                        "county": "Utah"
                    }
                ],
                "min_age": 2.0,
                "max_age": 18.0,
                "waitlist": "Afterschool - 9 months;\r\n Daytime - 1-\r\n 2 months",
                "telehealth_services": "No",
                "spanish_speakers": "No",
                "at_home_services": null,
                "in_clinic_services": null
            }
        }
    ]
}