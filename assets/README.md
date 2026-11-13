# Approved property media assets

Keep only VKS Realty-approved media here. Do not put private client information in this folder.

Recommended structure:

```
assets/
  projects/
    vihaan-villa/
      panoramas/
        lobby-360.jpg
        living-room-360.jpg
      models/
        villa.glb
      hotspots.json
    casa-view-apartments/
    grand-ultima/
    krystal-supremes/
    twin-chalet/
    green-villa/
```

## Panorama requirements
- Equirectangular 360° image, ideally 2:1 aspect ratio (for example 8192 × 4096 or 6000 × 3000).
- Full spherical capture, not a normal wide-angle photograph.
- Capture and publish only rooms/areas approved for marketing.
- Provide a scene ID, project ID, capture date and orientation/heading metadata.
- Blur faces, number plates and personal information before publication.

## 3D model requirements
- Prefer self-contained binary GLB.
- Optimize polygon count and texture sizes for mobile.
- Apply real-world scale, correct origin, materials and lighting.
- Include a source/approval record and model version.
- Do not use generic sample models as if they depict a VKS project.

## Hotspots
For each approved panorama, provide hotspot IDs and yaw/pitch coordinates, labels, descriptions and optional target scene IDs. Do not invent room dimensions, amenities or specifications.

The immersive viewer currently accepts local image and GLB uploads for preview in the browser. Those uploads are not persisted or shared with guests. To publish project tours, add approved assets to this structure and connect a project-scene manifest and storage/CDN URL. 
