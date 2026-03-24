declare module "zipcodes" {
  export function lookup(zip: string | number): Record<string, unknown> | undefined;
  export function distance(
    zipA: string | number,
    zipB: string | number
  ): number | null;
}
