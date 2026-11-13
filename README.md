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


## Immersive property experience

- `/explore.html` — six-project room navigation, sample hotspot overlays and the co-browsing invitation panel.
- `/immersive.html` — Three.js 360° equirectangular panorama viewer, GLB model viewer and WebXR immersive-VR entry on supported devices.
- `/realtime` — standalone Node.js + SSE session service for private collaboration. Deploy separately on a persistent Node host; it is not hosted by the Vercel static deployment.

### Asset readiness

The immersive page now includes a CC0 sample 360° environment from Poly Haven, a browser-generated sample apartment GLB, local file upload for your own panorama/GLB files, and six additional representative interior/exterior gallery images. The sample environment and model are illustrative only and are not VKS property scans or approved project models. User-selected files stay local to that browser session and are not uploaded or made available to invited guests. Actual VKS project tours require approved 360° captures, optimized GLB models, scene manifests and hotspot coordinates. See `assets/README.md`.

### Current rollout status

| Capability | Implementation status |
|---|---|
| 360° navigation | Viewer implemented; approved panorama assets pending |
| Navigable 3D / GLB | Viewer implemented; approved VKS GLB models pending |
| Co-browsing | Session API and explorer UI foundation committed; deploy realtime service and configure its HTTPS origin before live use |
| VR | WebXR immersive-VR entry implemented; compatible headset/browser and secure context required |

The sample listing images and illustrative project details are not verified project media or specifications. Do not present them as actual VKS site imagery.


### Sample media sources

- Sample 360° environment: [Poly Haven Studio](https://polyhaven.com/a/poly_haven_studio), CC0. The viewer loads the 4K tonemapped JPG from Poly Haven's download CDN.
- Sample apartment GLB: generated procedurally in the browser with Three.js geometry and exported to GLB for viewer testing. It is not a surveyed floor plan or a real VKS unit.
- Additional gallery photographs: Unsplash image CDN; used as illustrative design references, not project-specific marketing photography.
