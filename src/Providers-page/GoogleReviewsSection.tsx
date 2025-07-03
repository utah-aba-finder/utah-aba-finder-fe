import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, ExternalLink, MapPin, Phone, Globe } from 'lucide-react';
import { GooglePlacesAPI, GoogleReview, GooglePlaceDetails, formatReviewDate } from '../Utility/GooglePlacesAPI';
import './GoogleReviewsSection.css';

interface GoogleReviewsSectionProps {
  providerName: string;
  providerAddress: string;
  providerWebsite?: string;
  googleApiKey: string;
}

// Helper to normalize strings for comparison
function normalize(str: string) {
  return str
    .toLowerCase()
    .replace(/(llc|inc|pllc|plc|corp|corporation|co|ltd|\.|,)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Helper to check if two strings are a close match
function isCloseMatch(a: string, b: string) {
  return normalize(a) === normalize(b);
}

const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({ 
  providerName, 
  providerAddress, 
  providerWebsite,
  googleApiKey 
}) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [placeDetails, setPlaceDetails] = useState<GooglePlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadGoogleReviews();
    // eslint-disable-next-line
  }, [providerName, providerAddress, providerWebsite, googleApiKey]);

  const loadGoogleReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!googleApiKey || googleApiKey.trim() === '') {
        setError('Google Places API not configured.');
        setLoading(false);
        return;
      }

      const googlePlaces = new GooglePlacesAPI(googleApiKey);
      const result = await googlePlaces.searchAndGetReviews(providerName, providerAddress, providerWebsite);

      // Only show reviews if the match is strong
      if (result.placeDetails) {
        const place = result.placeDetails;
        let nameMatch = isCloseMatch(providerName, place.name);
        let addressMatch = false;
        if (place.formatted_address) {
          // Only compare the city/state/zip part for flexibility
          const providerAddrNorm = providerAddress.split(',').pop()?.trim() || providerAddress;
          const placeAddrNorm = place.formatted_address.split(',').pop()?.trim() || place.formatted_address;
          addressMatch = isCloseMatch(providerAddrNorm, placeAddrNorm);
        }
        let websiteMatch = false;
        if (providerWebsite && place.website) {
          const getDomain = (url: string) => {
            try {
              return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
            } catch {
              return url;
            }
          };
          websiteMatch = getDomain(providerWebsite) === getDomain(place.website);
        }
        
        // Show reviews if there's a name match (more flexible)
        if (nameMatch) {
          setPlaceDetails(place);
          setReviews(result.reviews);
        } else {
          setPlaceDetails(null);
          setReviews([]);
          setError(`No Google reviews found for ${providerName}`);
        }
      } else {
        setPlaceDetails(null);
        setReviews([]);
        setError(`No Google reviews found for ${providerName}`);
      }
    } catch (err) {
      console.error('Error loading Google reviews:', err);
      setError(`Unable to load Google reviews for ${providerName}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#FFD700' : 'none'}
        stroke={i < rating ? '#FFD700' : '#D1D5DB'}
        className="star-icon"
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="google-reviews-section">
        <div className="reviews-loading">
          <div className="loading-spinner"></div>
          <p>Loading Google reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="google-reviews-section">
        <div className="reviews-error">
          <MessageCircle size={24} />
          <p>{error}</p>
          <button onClick={loadGoogleReviews} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!placeDetails || reviews.length === 0) {
    return (
      <div className="google-reviews-section">
        <div className="no-reviews">
          <MessageCircle size={24} />
          <p>No Google reviews found for {providerName}</p>
          <p>This provider may not have a Google Business listing yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="google-reviews-section">
      <div className="reviews-header">
        <div className="reviews-title">
          <MessageCircle size={24} />
          <h3>Google Reviews</h3>
        </div>
        
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-number">{getAverageRating()}</span>
            <div className="stars">{renderStars(Math.round(getAverageRating()))}</div>
            <span className="review-count">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {placeDetails && (
        <div className="google-listing-info">
          <div className="listing-header">
            <h4>{placeDetails.name}</h4>
            {placeDetails.rating && (
              <div className="listing-rating">
                <span className="rating-number">{placeDetails.rating}</span>
                <div className="stars">{renderStars(Math.round(placeDetails.rating))}</div>
                {placeDetails.user_ratings_total && (
                  <span className="total-reviews">({placeDetails.user_ratings_total} total)</span>
                )}
              </div>
            )}
          </div>
          
          <div className="listing-details">
            {placeDetails.formatted_address && (
              <div className="listing-detail">
                <MapPin size={16} />
                <span>{placeDetails.formatted_address}</span>
              </div>
            )}
            {placeDetails.phone && (
              <div className="listing-detail">
                <Phone size={16} />
                <a href={`tel:${placeDetails.phone}`}>{placeDetails.phone}</a>
              </div>
            )}
            {placeDetails.website && (
              <div className="listing-detail">
                <Globe size={16} />
                <a href={placeDetails.website} target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="reviews-list">
        {displayedReviews.map((review, index) => (
          <div key={index} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.profile_photo_url ? (
                    <img 
                      src={review.profile_photo_url} 
                      alt={review.author_name}
                      className="avatar-image"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="reviewer-details">
                  <span className="reviewer-name">{review.author_name}</span>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <div className="review-date">
                {formatReviewDate(review.time)}
              </div>
            </div>
            
            <p className="review-content">{review.text}</p>
            
            {review.author_url && (
              <div className="review-link">
                <a 
                  href={review.author_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="google-profile-link"
                >
                  View on Google <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="reviews-actions">
          <button
            className="toggle-reviews-button"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}

      <div className="google-attribution">
        <p>
          Reviews powered by{' '}
          <a 
            href="https://developers.google.com/maps/documentation/places/web-service" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Google Places API
          </a>
        </p>
      </div>
    </div>
  );
};

export default GoogleReviewsSection; 