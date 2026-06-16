import React from 'react';
import { Link } from 'react-router-dom';
import { ProviderAttributes } from '../Utility/Types';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  Briefcase,
  Home,
  Building,
  Monitor,
  GitCompare,
  UserPlus,
} from 'lucide-react';
import {
  buildProviderClaimSignupPath,
  shouldShowClaimListingEntry,
  getClaimListingCtaTone,
} from '../Utility/claimListingSignup';
import './ProviderCard.css';
import { toast } from 'react-toastify';
import ProviderLogo from '../Utility/ProviderLogo';

interface ProviderCardProps {
  provider: ProviderAttributes;
  onViewDetails: (provider: ProviderAttributes) => void;
  onToggleCompare: (providerId: number) => void;
  isInCompare: boolean;
  /** True when compare list is full (3) and this provider is not in the list */
  compareSlotFull: boolean;
  selectedState: string;
  hasReviews?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onViewDetails,
  onToggleCompare,
  isInCompare,
  compareSlotFull,
  selectedState,
  hasReviews
}) => {
  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCompare && compareSlotFull) {
      toast.info('You can compare up to 3 providers. Remove one on the Compare page.', {
        autoClose: 4000,
      });
      return;
    }
    if (isInCompare) {
      setTimeout(() => {
        toast.info(`${provider.name} removed from compare`, { autoClose: 2500 });
      }, 200);
      onToggleCompare(provider.id);
    } else {
      setTimeout(() => {
        toast.success(`${provider.name} added to compare`, { autoClose: 2500 });
      }, 200);
      onToggleCompare(provider.id);
    }
  };

  // Filter locations based on selected state
  const filteredLocations = selectedState && selectedState !== 'none' && selectedState !== ''
    ? provider.locations.filter(location => location.state?.toUpperCase() === selectedState?.toUpperCase())
    : provider.locations;

  // Use the first matching location, or fall back to the first location if none match
  const primaryLocation = filteredLocations[0] || provider.locations[0];

  const claimListingHref = buildProviderClaimSignupPath(provider.id, {
    name: provider.name,
    website: provider.website,
  });
  const showClaimListing = shouldShowClaimListingEntry(provider);
  const claimListingTone = getClaimListingCtaTone(provider);

  // Render service delivery badges
  const renderServiceDeliveryBadges = () => {
    const badges = [];
    
    if (provider.in_home_only) {
      badges.push(
        <span key="in-home-only" className="service-badge in-home-only">
          <Home size={12} style={{ marginRight: '4px' }} />
          In-Home Only
        </span>
      );
    } else {
      // Prioritize service_delivery object (new structure) over old string fields
      const hasServiceDelivery = provider.service_delivery && typeof provider.service_delivery === 'object';
      
      if (hasServiceDelivery) {
        // Use service_delivery boolean values
        if (provider.service_delivery.in_home === true) {
          badges.push(
            <span key="in-home" className="service-badge in-home">
              <Home size={12} style={{ marginRight: '4px' }} />
              In-Home
            </span>
          );
        }
        if (provider.service_delivery.in_clinic === true) {
          badges.push(
            <span key="in-clinic" className="service-badge in-clinic">
              <Building size={12} style={{ marginRight: '4px' }} />
              In-Clinic
            </span>
          );
        }
        if (provider.service_delivery.telehealth === true) {
          badges.push(
            <span key="telehealth" className="service-badge telehealth">
              <Monitor size={12} style={{ marginRight: '4px' }} />
              Telehealth
            </span>
          );
        }
      } else {
        // Fallback to old string-based fields for backward compatibility
        if (provider.at_home_services && provider.at_home_services.toLowerCase().includes('yes')) {
          badges.push(
            <span key="in-home" className="service-badge in-home">
              <Home size={12} style={{ marginRight: '4px' }} />
              In-Home
            </span>
          );
        }
        if (provider.in_clinic_services && provider.in_clinic_services.toLowerCase().includes('yes')) {
          badges.push(
            <span key="in-clinic" className="service-badge in-clinic">
              <Building size={12} style={{ marginRight: '4px' }} />
              In-Clinic
            </span>
          );
        }
        if (provider.telehealth_services && provider.telehealth_services.toLowerCase().includes('yes')) {
          badges.push(
            <span key="telehealth" className="service-badge telehealth">
              <Monitor size={12} style={{ marginRight: '4px' }} />
              Telehealth
            </span>
          );
        }
      }
    }
    
    return badges.length > 0 ? (
      <div className="service-delivery-badges">
        {badges}
      </div>
    ) : null;
  };

  return (
    <div className={`searched-provider-card ${provider.locations.length > 1 ? 'multiple-locations' : ''}`}>
      <div className="provider-card">
        {/* <div className="featured-badge">Proud Sponsor</div> */}
        {hasReviews && (
          <div className="reviews-badge">
            <span className="reviews-badge-text">⭐ Has Reviews</span>
          </div>
        )}
              <div className="card-logo-and-text">
        <div className="card-header">
          <div className="card-logo-section">
            <ProviderLogo
              provider={provider}
              className="provider-logo"
              size="medium"
            />
          </div>
          <div className="card-name title">{provider.name}</div>
        </div>
          <div className="card-text-and-buttons">
            <div className="card-text text">
              
              {/* Service delivery badges */}
              {renderServiceDeliveryBadges()}
              
              {/* Provider Type Badges */}
              {provider.provider_type && provider.provider_type.length > 0 && (
                <div className="provider-type-badges">
                  <h4>
                    <strong>Provider Specialties:</strong>
                  </h4>
                  <div className="provider-type-chips">
                    {provider.provider_type.map((type, index) => (
                      <span key={index} className="provider-type-chip">
                        {type.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Educational Programs - Show key program info on card */}
              {(() => {
                const providerCategory = (provider as any).category || provider.category;
                const categoryFields = (provider as any).category_fields || provider.category_fields;
                const providerAttributes = (provider as any).provider_attributes || provider.provider_attributes;
                
                
                // Try to get values from category_fields first, then fall back to provider_attributes
                let programTypesValue: string[] | null = null;
                let ageGroupsValue: string[] | null = null;
                let deliveryFormatValue: string[] | null = null;
                let parentCaregiverSupportValue: boolean | null = null;
                let additionalInformationValue: string | null = null;
                
                if (categoryFields && categoryFields.length > 0) {
                  const programTypes = categoryFields.find((f: any) => f.slug === 'program_types');
                  const ageGroups = categoryFields.find((f: any) => f.slug === 'age_groups');
                  const deliveryFormat = categoryFields.find((f: any) => f.slug === 'delivery_format');
                  const parentCaregiverSupport = categoryFields.find((f: any) => f.slug === 'parent_caregiver_support');
                  const additionalInformation = categoryFields.find((f: any) => f.slug === 'additional_information' || f.name === 'Additional Information');
                  
                  programTypesValue = programTypes?.value && Array.isArray(programTypes.value) ? programTypes.value : null;
                  ageGroupsValue = ageGroups?.value && Array.isArray(ageGroups.value) ? ageGroups.value : null;
                  deliveryFormatValue = deliveryFormat?.value && Array.isArray(deliveryFormat.value) ? deliveryFormat.value : null;
                  
                  // Get Additional Information as string
                  if (additionalInformation?.value && typeof additionalInformation.value === 'string' && additionalInformation.value.trim().length > 0) {
                    additionalInformationValue = additionalInformation.value;
                  }
                  
                  // Convert parentCaregiverSupport value to boolean, handling strings and numbers
                  if (parentCaregiverSupport?.value !== undefined && parentCaregiverSupport.value !== null) {
                    let boolValue = parentCaregiverSupport.value;
                    // Convert string "true"/"false" to boolean
                    if (typeof boolValue === 'string') {
                      boolValue = boolValue.toLowerCase() === 'true' || boolValue === '1';
                    }
                    // Convert numeric 1/0 to boolean
                    if (typeof boolValue === 'number') {
                      boolValue = boolValue === 1;
                    }
                    parentCaregiverSupportValue = typeof boolValue === 'boolean' ? boolValue : null;
                  } else {
                    parentCaregiverSupportValue = null;
                  }
                } else if (providerAttributes) {
                  // Fall back to provider_attributes if category_fields not available
                  // Backend returns field names (e.g., "Program Types") not slugs (e.g., "program_types")
                  const getValue = (fieldName: string, slug: string) => {
                    let value = providerAttributes[fieldName];
                    if (value === undefined) {
                      value = providerAttributes[slug];
                    }
                    // Backend may return comma-separated strings, convert to arrays
                    if (typeof value === 'string') {
                      value = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    }
                    return Array.isArray(value) && value.length > 0 ? value : null;
                  };
                  
                  const getStringValue = (fieldName: string, slug: string) => {
                    let value = providerAttributes[fieldName];
                    if (value === undefined) {
                      value = providerAttributes[slug];
                    }
                    return typeof value === 'string' && value.trim().length > 0 ? value : null;
                  };
                  
                  const getBooleanValue = (fieldName: string, slug: string) => {
                    let value = providerAttributes[fieldName];
                    if (value === undefined) {
                      value = providerAttributes[slug];
                    }
                    // Convert string "true"/"false" to boolean
                    if (typeof value === 'string') {
                      value = value.toLowerCase() === 'true' || value === '1';
                    }
                    // Convert numeric 1/0 to boolean
                    if (typeof value === 'number') {
                      value = value === 1;
                    }
                    // Return boolean if we have a valid value, otherwise null
                    return typeof value === 'boolean' ? value : null;
                  };
                  
                  programTypesValue = getValue('Program Types', 'program_types');
                  ageGroupsValue = getValue('Age Groups', 'age_groups');
                  deliveryFormatValue = getValue('Delivery Format', 'delivery_format');
                  parentCaregiverSupportValue = getBooleanValue('Parent/Caregiver Support', 'parent_caregiver_support');
                  additionalInformationValue = getStringValue('Additional Information', 'additional_information');
                }
                
                if (providerCategory === 'educational_programs' && (programTypesValue || ageGroupsValue || deliveryFormatValue || parentCaregiverSupportValue !== null || additionalInformationValue)) {
                  const previewItems = [];
                  if (programTypesValue && programTypesValue.length > 0) {
                    previewItems.push(`Programs: ${programTypesValue.slice(0, 2).join(', ')}${programTypesValue.length > 2 ? '...' : ''}`);
                  }
                  if (ageGroupsValue && ageGroupsValue.length > 0) {
                    previewItems.push(`Ages: ${ageGroupsValue.join(', ')}`);
                  }
                  if (deliveryFormatValue && deliveryFormatValue.length > 0) {
                    previewItems.push(`Format: ${deliveryFormatValue.join(', ')}`);
                  }
                  if (parentCaregiverSupportValue !== null) {
                    previewItems.push(`Parent/Caregiver Support: ${parentCaregiverSupportValue ? "Yes" : "No"}`);
                  }
                  if (additionalInformationValue) {
                    // Truncate Additional Information to first 100 characters for preview
                    const truncated = additionalInformationValue.length > 100 
                      ? additionalInformationValue.substring(0, 100) + '...' 
                      : additionalInformationValue;
                    previewItems.push(`Additional Info: ${truncated}`);
                  }
                  
                  if (previewItems.length > 0) {
                    return (
                      <div className="educational-programs-preview" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                          <strong>Program Details:</strong>
                        </h4>
                        <div style={{ fontSize: '12px', color: '#1e3a8a' }}>
                          {previewItems.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '4px' }}>{item}</div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}


              
              <h4>
                <strong>
                  <MapPin style={{ marginRight: '8px' }} />
                  <span>Address: </span>
                </strong>
                {provider.in_home_only ? (
                  'In-Home Services Only - No Physical Location'
                ) : primaryLocation ? (
                  <>
                    {primaryLocation.address_1}
                    {primaryLocation?.address_2 && `, ${primaryLocation.address_2}`}
                    {primaryLocation?.city && `, ${primaryLocation.city}`}
                    {primaryLocation?.state && `, ${primaryLocation.state}`}
                    {primaryLocation?.zip && ` ${primaryLocation.zip}`}
                  </>
                ) : (
                  'This provider offers virtual/remote services only.'
                )}
              </h4>
              <h4>
                <strong><Phone style={{ marginRight: '8px' }} />
                  Phone: </strong><a href={`tel:${primaryLocation?.phone}`} className='custom-link'>{primaryLocation?.phone || 'Phone number is not available.'}</a>
              </h4>
              {/* Show email and website for all providers */}
              <h4>
                <strong><Mail style={{ marginRight: '8px' }} />
                  Email: </strong><a href={`mailto:${provider.email}`} className='custom-link'>{provider.email || 'Email is not available.'}</a>
              </h4>
              <h4>
                <strong><Globe style={{ marginRight: '8px' }} />
                  Website: </strong>
                <a
                  href={provider.website 
                    ? (provider.website.startsWith('http://') || provider.website.startsWith('https://') 
                        ? provider.website 
                        : `https://${provider.website}`)
                    : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="custom-link"
                >
                  {provider.website ?? 'Provider does not have a website yet.'}
                </a>
              </h4>
              {/* Show services only for in-home providers */}
              {provider.in_home_only && (
                <h4>
                  <strong><Briefcase style={{ marginRight: '8px' }} />
                    Provider Services: </strong>
                  {provider.provider_type.length > 0 ? (
                    provider.provider_type.map(type => type.name).join(', ')
                  ) : (
                    'Services information not available.'
                  )}
                </h4>
              )}
              {isInCompare && (
                <div className="compare-badge text">
                  In compare
                </div>
              )}
              {showClaimListing && (
                <div
                  className={`provider-card-claim-cta ${
                    claimListingTone === 'prominent'
                      ? 'provider-card-claim-cta--prominent'
                      : 'provider-card-claim-cta--subtle'
                  }`}
                >
                  <UserPlus size={14} className="provider-card-claim-icon" aria-hidden />
                  {claimListingTone === 'prominent' ? (
                    <>
                      <span className="provider-card-claim-text">Unclaimed listing.</span>
                      <Link to={claimListingHref} className="provider-card-claim-link" onClick={(e) => e.stopPropagation()}>
                        Claim your practice
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="provider-card-claim-text">Is this your practice?</span>
                      <Link to={claimListingHref} className="provider-card-claim-link" onClick={(e) => e.stopPropagation()}>
                        Request access
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="provider-card-buttons">
              <button className="view-details-button" onClick={() => onViewDetails(provider)}>
                <Eye size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Details
              </button>
              <button
                type="button"
                className={`compare-button ${isInCompare ? 'in-compare' : ''}`}
                onClick={handleToggleCompare}
                title={
                  !isInCompare && compareSlotFull
                    ? 'Compare list is full (3) — open Compare to remove one'
                    : undefined
                }
              >
                <GitCompare size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {isInCompare ? 'Remove' : 'Add to compare'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;