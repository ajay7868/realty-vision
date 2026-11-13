# VKS Realty 2.0

VKS Realty website and interactive property showcase.

Listing prices and availability are indicative and must be confirmed with VKS Realty. 3D geometry and imagery are illustrative until replaced with approved project assets.

## Lead capture configuration

The website form posts to `/api/lead`. The API keeps credentials server-side and can create/update a HubSpot contact, attach an enquiry note, and send an email notification to `sales@vksrealtygroup.com`.

Add these **Production** environment variables in Vercel → Project → Settings → Environment Variables. Never put these secrets in browser JavaScript or commit them to Git:

- `HUBSPOT_ACCESS_TOKEN`: HubSpot private-app access token with CRM contacts and notes read/write scopes.
- `RESEND_API_KEY`: Resend API key.
- `RESEND_FROM_EMAIL`: A sender address on a domain verified in Resend, e.g. `VKS Realty <leads@your-verified-domain>`.
- `LEAD_ALLOWED_ORIGINS` (optional): comma-separated allowed origins. Defaults to `https://vks-realty-2-0.vercel.app`.

After adding or changing environment variables, redeploy Production. Until both HubSpot and Resend are configured, the endpoint intentionally returns a configuration error rather than pretending a lead was delivered.

### HubSpot setup

Create a HubSpot private app and grant CRM contacts and notes read/write scopes. Store its token only in Vercel environment variables. The integration creates or updates a contact (email-based when supplied) and associates a note containing the project interest and enquiry message.

### Email setup

Verify the sending domain in Resend, create an API key, and set `RESEND_FROM_EMAIL` to an address on that verified domain. Notifications are sent to `sales@vksrealtygroup.com`.
