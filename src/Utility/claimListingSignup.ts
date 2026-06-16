import type { ProviderAttributes } from './Types';

/**
 * Builds /provider-signup query for "claim this listing" deep links from directory cards/modal.
 */
export function buildProviderClaimSignupPath(
  providerId: number,
  attrs: Pick<ProviderAttributes, 'name' | 'website'>
): string {
  const params = new URLSearchParams();
  params.set('claim', '1');
  params.set('provider_id', String(providerId));
  if (attrs.name) params.set('provider_name', attrs.name);
  if (attrs.website) params.set('website', attrs.website);
  return `/provider-signup?${params.toString()}`;
}

/** API explicitly marks an unclaimed listing (e.g. user_id null or claimed false). */
export function isListingUnclaimedExplicit(provider: ProviderAttributes): boolean {
  if (provider.claimed === false) return true;
  if (provider.user_id === null) return true;
  return false;
}

/** API indicates someone already owns this listing — hide public claim prompts. */
export function isListingClaimed(provider: ProviderAttributes): boolean {
  if (provider.claimed === true) return true;
  if (typeof provider.user_id === 'number' && provider.user_id > 0) return true;
  return false;
}

/** Show claim entry when not known to be claimed (unknown API shape → still show subtle hint). */
export function shouldShowClaimListingEntry(provider: ProviderAttributes): boolean {
  return !isListingClaimed(provider);
}

export type ClaimCtaTone = 'prominent' | 'subtle';

export function getClaimListingCtaTone(provider: ProviderAttributes): ClaimCtaTone {
  return isListingUnclaimedExplicit(provider) ? 'prominent' : 'subtle';
}
