# VKS Realty 2.0

VKS Realty website and interactive property showcase.

Listing prices and availability are indicative and must be confirmed with VKS Realty. 3D geometry and imagery are illustrative until replaced with approved project assets.

## Lead capture configuration

The website form posts to `/api/lead`. The API keeps credentials server-side and creates/updates a HubSpot contact, then attaches the enquiry details as a CRM note. Email notifications are optional and are deliberately not being configured at this stage.

For the current HubSpot-only setup, add this **Production** environment variable in Vercel → Project → Settings → Environment Variables. Never put secrets in browser JavaScript or commit them to Git:

- `HUBSPOT_ACCESS_TOKEN`: HubSpot private-app access token with CRM contacts and notes read/write scopes.
- `LEAD_ALLOWED_ORIGINS` (optional): comma-separated allowed origins. Defaults to `https://vks-realty-2-0.vercel.app`.

After adding or changing environment variables, redeploy Production. The form will report an error until the HubSpot token is configured; it will not claim an enquiry was saved when it was not.

### HubSpot setup

Create a HubSpot private app and grant CRM contacts and notes read/write scopes. Store its token only in Vercel environment variables. The integration creates or updates a contact (email-based when supplied) and associates a note containing the project interest and enquiry message.

### Optional email notifications (later)

Email delivery is intentionally disabled for the current rollout. When ready, verify a sending domain in Resend, create an API key, and set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Notifications will go to `sales@vksrealtygroup.com`.
