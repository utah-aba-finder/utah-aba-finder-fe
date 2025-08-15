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
  const normalizedA = normalize(a);
  const normalizedB = normalize(b);
  
  // Exact match
  if (normalizedA === normalizedB) return true;
  
  // Check if one contains the other (for partial matches)
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return true;
  
  // Check for common business name patterns
  const wordsA = normalizedA.split(/\s+/);
  const wordsB = normalizedB.split(/\s+/);
  
  // If both have multiple words, check if they share key words
  if (wordsA.length > 1 && wordsB.length > 1) {
    const commonWords = wordsA.filter(word => word.length > 2 && wordsB.includes(word));
    if (commonWords.length >= Math.min(wordsA.length, wordsB.length) * 0.6) return true;
  }
  
  return false;
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    loadGoogleReviews();
    // eslint-disable-next-line
  }, [providerName, providerAddress, providerWebsite, googleApiKey]);

  const loadGoogleReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      

      if (!googleApiKey || googleApiKey.trim() === '') {

        setError('Google reviews are not available at this time.');
        setLoading(false);
        return;
      }

      // Note: Google reviews should work in both development and production
      // The proxy server needs to be running for local development
      // For production, the API calls should go through a backend service

      const googlePlaces = new GooglePlacesAPI(googleApiKey);
      
      // First validate the API key
      
      const validation = await googlePlaces.validateAPIKey();
      
      
      if (!validation.valid) {
        
        setError('Google reviews are not available at this time.');
        setLoading(false);
        return;
      }

      
      
      
      const result = await googlePlaces.searchAndGetReviews(providerName, providerAddress, providerWebsite);
      


      // Only show reviews if the match is strong
      if (result.placeDetails) {
        const place = result.placeDetails;
        let nameMatch = isCloseMatch(providerName, place.name);
        // addressMatch and websiteMatch removed as they're unused
        

        
        // Show reviews if there's a name match (more flexible)
        if (nameMatch) {

          setPlaceDetails(place);
          setReviews(result.reviews);
        } else {

          setPlaceDetails(null);
          setReviews([]);
          setError(`No Google reviews found for ${providerName}.`);
        }
      } else {

        setPlaceDetails(null);
        setReviews([]);
        setError(`No Google reviews found for ${providerName}.`);
      }
    } catch (err) {

      // Check if it's a network timeout or connection error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Unable to load reviews at this time. Please check your internet connection and try again.');
      } else {
        setError('Google reviews are not available at this time.');
      }
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
          {isMobile ? (
            <div>
              <p>Google reviews are available on desktop devices.</p>
              <p className="text-sm text-gray-600 mt-2">
                For the best experience viewing Google reviews, please visit this page on a desktop computer.
              </p>
            </div>
          ) : (
            <p>{error}</p>
          )}
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
          {isMobile ? (
            <div>
              <p>Google reviews are available on desktop devices.</p>
              <p className="text-sm text-gray-600 mt-2">
                For the best experience viewing Google reviews, please visit this page on a desktop computer.
              </p>
            </div>
          ) : (
            <>
              <p>No Google reviews found for {providerName}</p>
              <p>This provider may not have a Google Business listing yet.</p>
            </>
          )}
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