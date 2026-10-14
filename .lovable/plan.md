# Next Step: Make the Brand Your Own

## Goal
Replace the original AM Enterprise LLC identity with a clean, customizable brand setup so the site feels like yours immediately after the remix.

## What we'll do
1. Create a single brand config file (`src/lib/brand.ts`) that holds name, tagline, contact info, social links, and key URLs.
2. Update `src/lib/site.ts` to read from that config and use the preview origin when no custom domain is set.
3. Swap the homepage hero headline and subheadline to a generic, compelling agency message driven by the brand config.
4. Update the root route meta (title/description/OG) to use the new brand values.
5. Add a short README note explaining where to edit brand values.

## Out of scope
- Full color re-theme (we'll keep the existing palette, which is already neutral/professional).
- Logo image replacement (we'll keep the existing asset path but point to the new config).
- Rewriting every page (we'll update the most visible shared pieces first).

## Success criteria
- The homepage no longer says "AM Enterprise LLC" in the hero or browser tab.
- A non-technical user can open `src/lib/brand.ts` and change the company name/tagline in one place.
- The site still builds and the preview loads without errors.
