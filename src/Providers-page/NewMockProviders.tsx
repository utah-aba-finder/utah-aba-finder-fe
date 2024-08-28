export interface Location {
    name: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
  }
  
  export interface Insurance {
    name: string;
  }
  
  export interface CountiesServed {
    county: string;
  }
  
  export interface ProviderAttributes {
    name: string;
    locations: Location[];
    website: string;
    email: string;
    cost: string;
    insurance: Insurance[];
    counties_served: CountiesServed[];
    min_age: number;
    max_age: number;
    waitlist: string;
    telehealth_services: string;
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
              address_1: null,
              address_2: null,
              city: null,
              state: null,
              zip: null,
              phone: "801-435-8088",
            },
          ],
          website: "https://www.bridgecareaba.com/locations/utah",
          email: "info@bridgecareaba.com",
          cost: "N/A",
          insurance: [{ name: "Contact us" }],
          counties_served: [{ county: "Salt Lake, Utah, Davis, Weber" }],
          min_age: 2.0,
          max_age: 16.0,
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
          name: "Above & Beyond Therapy",
          locations: [
            {
              name: "https://www.abtaba.com/locations/aba-therapy-in-utah",
              address_1: null,
              address_2: null,
              city: null,
              state: null,
              zip: null,
              phone: "(801) 630-2040",
            },
          ],
          website: "https://www.abtaba.com/",
          email: "info@abtaba.com",
          cost: "Out-of-Network and single-case agreements.",
          insurance: [
            { name: "Blue Cross Blue Shield (BCBS)" },
            { name: "Deseret Mutual Benefit Administrators (DMBA)" },
            { name: "EMI Health" },
            { name: "Medicaid" },
            { name: "University of Utah Health Plans" },
          ],
          counties_served: [
            { county: "Utah, Salt Lake, Davis, Logan to Spanish Fork, Tooele" },
          ],
          min_age: 2.0,
          max_age: 21.0,
          waitlist: "No",
          telehealth_services: "Yes",
          spanish_speakers: null,
          at_home_services: null,
          in_clinic_services: null,
        },
      },
      {
        id: 3,
        type: "provider",
        attributes: {
          name: "ABA Pediatric Autism Services",
          locations: [
            {
              name: "https://www.abapediatricautismservices.com/locations",
              address_1: null,
              address_2: null,
              city: null,
              state: null,
              zip: null,
              phone: "(801) 762-8342",
            },
          ],
          website: "www.abapediatricautismservices.com",
          email: "info@abapediatricautismservices.com",
          cost: "Private pay rates available upon request",
          insurance: [
            { name: "Blue Cross Blue Shield (BCBS)" },
            { name: "Optum (UnitedHealth Group)" },
            { name: "PEHP (Public Employees Health Program)" },
            { name: "Select Health" },
            { name: "United HealthCare (UHC)" },
            { name: "University of Utah Health Plans" },
          ],
          counties_served: [{ county: "Davis, Salt Lake, Weber" }],
          min_age: 1.5,
          max_age: 6.0,
          waitlist: "No",
          telehealth_services: "limited",
          spanish_speakers: null,
          at_home_services: null,
          in_clinic_services: null,
        },
      },
    ],
  };