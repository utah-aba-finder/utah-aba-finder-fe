import React from 'react';
import { Helmet } from 'react-helmet';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'LocalBusiness' | 'Service';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(baseData)}
      </script>
    </Helmet>
  );
};

export default StructuredData; 