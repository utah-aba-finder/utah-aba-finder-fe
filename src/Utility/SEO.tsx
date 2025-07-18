import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Autism Services Locator - Find Autism Service Providers",
  description = "Free Directory of Autism Services Providers in the United States. Find autism evaluations, ABA therapy, speech therapy, and occupational therapy services near you.",
  keywords = "autism services, ABA therapy, autism providers, autism evaluation, speech therapy, occupational therapy, autism spectrum disorder, ASD, autism treatment, autism resources",
  image = "https://autismserviceslocator.com/ASL_5.2.png",
  url = "https://autismserviceslocator.com",
  type = "website",
  canonical
}) => {
  const fullUrl = canonical || url;
  const fullTitle = title.includes("Autism Services Locator") ? title : `${title} | Autism Services Locator`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Autism Services Locator" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@autismserviceslocator" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Autism Services Locator" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

export default SEO; 