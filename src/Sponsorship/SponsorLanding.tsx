import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, BadgeInfo, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Provider-login/AuthProvider";
import { getApiBaseUrl } from "../Utility/config";
import FeaturedMiniBadge from "../Assets/sponsor-images/ASL_MiniBadge_Featured.svg";
import SponsorMiniBadge from "../Assets/sponsor-images/ASL_MiniBadge_Sponsor.svg";
import PartnerMiniBadge from "../Assets/sponsor-images/ASL_MiniBadge_CommunityPartner.svg";

// --- Helper components ---
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const TierCard: React.FC<{
  title: string;
  price: string;
  annualPrice?: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  onSelect: () => void;
  isLoading?: boolean;
  billingPeriod?: 'monthly' | 'annual';
  badgeImageSrc?: string;
}> = ({ title, price, annualPrice, tagline, features, highlight = false, badge, onSelect, isLoading = false, billingPeriod = 'monthly', badgeImageSrc }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
    className={`relative flex flex-col rounded-2xl border ${
      highlight ? "border-teal-500 shadow-xl shadow-teal-500/10" : "border-zinc-200 shadow-sm"
    } bg-white p-6 sm:p-8`}
  >
    {badge && (
      <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full border border-teal-600 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
        <Sparkles className="h-3.5 w-3.5" /> {badge}
      </div>
    )}
    <div className="mb-4 flex items-center gap-3">
      {badgeImageSrc && (
        <img
          src={badgeImageSrc}
          alt={`${title} badge`}
          className="h-8 w-auto"
        />
      )}
      <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
    </div>
    <p className="mb-5 text-sm text-zinc-600">{tagline}</p>
    <div className="mb-6 flex flex-col items-center gap-1">
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-zinc-900">
          {billingPeriod === 'annual' && annualPrice ? annualPrice : price}
        </span>
        <span className="pb-1 text-sm text-zinc-500">
          /{billingPeriod === 'annual' ? 'year' : 'month'}
        </span>
      </div>
      {billingPeriod === 'annual' && annualPrice && (
        <div className="text-sm text-green-600 font-medium">
          ${(parseInt(annualPrice.replace('$', '')) / 10).toFixed(0)}/month billed annually
        </div>
      )}
    </div>
    <ul className="mb-6 space-y-3">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      disabled={isLoading}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
        highlight
          ? "bg-teal-600 text-white hover:bg-teal-700 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          : "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
      }`}
      aria-label={`Choose ${title}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : (
        <>
          Choose {title}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  </motion.div>
);

export default function SponsorLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, activeProvider, loggedInProvider } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Wire Stripe Checkout via backend
  async function createCheckout(plan: "featured" | "sponsor" | "partner", period: 'monthly' | 'annual' = 'monthly') {
    // Convert frontend format to backend format
    const billingPeriod = period === 'annual' ? 'year' : 'month';
    try {
      setLoadingTier(plan);
      
      // Check authentication first
      if (!isAuthenticated) {
        // Redirect to login with return path and plan info
        navigate('/login', { 
          state: { 
            from: '/sponsor', 
            action: 'sponsor',
            plan: plan 
          } 
        });
        return;
      }

      const providerId = activeProvider?.id || loggedInProvider?.id;
      if (!providerId) {
        alert('Please ensure you have an active provider account.');
        setLoadingTier(null);
        return;
      }

      const authToken = sessionStorage.getItem('authToken');
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      const userId = currentUser?.id?.toString() || authToken;

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/billing/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": userId || '',
        },
        credentials: "include",
        body: JSON.stringify({ 
          plan,
          provider_id: providerId,
          billing_period: billingPeriod
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Checkout failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // Stripe-hosted checkout
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || "We couldn't start checkout. Please try again or contact support.");
      setLoadingTier(null);
    }
  }

  const handleTierSelect = (tierName: string, period: 'monthly' | 'annual' = 'monthly') => {
    // Map tier names to plan IDs
    const planMap: { [key: string]: "featured" | "sponsor" | "partner" } = {
      "Featured Provider": "featured",
      "Sponsor Provider": "sponsor",
      "Community Partner": "partner",
    };

    const plan = planMap[tierName] || "featured";
    createCheckout(plan, period);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-10 md:grid-cols-1 items-center justify-center text-center">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Become a <span className="text-teal-600">Sponsored Provider</span>
              </motion.h1>
              <p className="mt-4 max-w-prose text-zinc-700 text-center mx-auto">
                Support families and grow your practice. Sponsored Providers are highlighted at the top of search results on
                <span className="font-semibold"> Autism Services Locator</span> and receive a distinctive sponsor badge.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200">
                  <ShieldCheck className="h-4 w-4 text-teal-600" /> Verified visibility
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200">
                  <HeartHandshake className="h-4 w-4 text-teal-600" /> Mission-driven nonprofit
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200"><HeartHandshake className="h-4 w-4 text-teal-600" /> <span className="font-semibold">Your sponsorship keeps our directory running and <strong>free for families</strong> nationwide.</span></div>
              </div>
            </div>
              
          
          </div>
        </Container>
      </header>

      {/* Pricing */}
      <section>
        <Container className="py-12 sm:py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-2 text-zinc-600">Choose a tier that fits your goals and budget.</p>
            
            {/* Billing Period Toggle */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingPeriod === 'annual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Annual (10 Months - 2 Free)
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <TierCard
              title="Featured Provider"
              price="$25"
              annualPrice="$250"
              tagline="Rise above free listings with a clean highlight."
              features={[
                "Priority placement above free listings",
                "Featured badge on profile",
                "Priority updates & review refresh",
              ]}
              onSelect={() => handleTierSelect("Featured Provider", billingPeriod)}
              isLoading={loadingTier === "featured"}
              billingPeriod={billingPeriod}
              badgeImageSrc={FeaturedMiniBadge}
            />
            <TierCard
              title="Sponsor Provider"
              price="$59"
              annualPrice="$590"
              tagline="Top placement + sponsor badge and logo."
              features={[
                "Top-of-list placement in service area",
                "Sponsor badge & logo in results",
                "Included in Featured Providers section",
                "Quarterly sponsor shout-out post",
              ]}
              highlight
              badge="Most popular"
              onSelect={() => handleTierSelect("Sponsor Provider", billingPeriod)}
              isLoading={loadingTier === "sponsor"}
              billingPeriod={billingPeriod}
              badgeImageSrc={SponsorMiniBadge}
            />
            <TierCard
              title="Community Partner"
              price="$99"
              annualPrice="$990"
              tagline="Premium visibility and community recognition."
              features={[
                "Everything in Sponsor Provider",
                "Logo on homepage (Community Partners)",
                "About-page supporter listing",
                "Newsletter recognition & social highlights",
              ]}
              onSelect={() => handleTierSelect("Community Partner", billingPeriod)}
              isLoading={loadingTier === "partner"}
              billingPeriod={billingPeriod}
              badgeImageSrc={PartnerMiniBadge}
            />
          </div>

          {billingPeriod === 'annual' && (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-700">
              <BadgeInfo className="mr-2 inline h-4 w-4 text-green-600" />
              <strong>Annual billing selected:</strong> Pay for 10 months, get 12 months of service (2 months free)!
            </div>
          )}
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50">
        <Container className="py-12 sm:py-16">
          <h3 className="mb-6 text-center text-xl font-semibold">Frequently asked questions</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h4 className="font-medium">How fast is activation?</h4>
              <p className="mt-2 text-sm text-zinc-600">Upgrades are typically applied within 24 hours of successful payment.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="mt-2 text-sm text-zinc-600">Yes. Cancel from your provider dashboard or by emailing us. Your listing stays active through the paid period.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h4 className="font-medium">Do you offer nonprofit discounts?</h4>
              <p className="mt-2 text-sm text-zinc-600">We're a nonprofit ourselves. If cost is a barrier, contact us and we'll work something out.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h4 className="font-medium">What about multiple locations?</h4>
              <p className="mt-2 text-sm text-zinc-600">We can scope multi-location visibility. Reach out and we'll tailor a plan.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600">
            <Mail className="h-4 w-4" />
            Questions? Email <a className="font-medium text-teal-700 underline" href="mailto:info@autismserviceslocator.com">info@autismserviceslocator.com</a>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <Container className="py-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Autism Services Locator • A nonprofit helping families find services
        </Container>
      </footer>
    </div>
  );
}
