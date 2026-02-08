# 3D Model Setup Guide

## Overview

Your Amidaddy.in store now includes professional 3D rendering with:

- ✨ Interactive 3D product viewers with drag/zoom controls
- 🎯 Auto-rotating product displays
- 💡 Advanced lighting and shadows
- 📦 Support for GLTF/GLB 3D models
- 🎨 Fallback to 2D images if no 3D model
- 🚀 High-performance rendering with WebGL

## Features

### ProductViewer3DEnhanced
The main 3D viewer component with:
- Auto-rotation that pauses on interaction
- Drag to rotate, scroll to zoom
- Reset view button
- Pause/Resume auto-rotation toggle
- Professional lighting setup
- Contact shadows for realism
- Loading indicator
- 2D image fallback

### ProductShowcase3D
Full-screen 3D showcase with:
- Animated rotating platform
- Advanced lighting effects
- Glass shine/reflection effects
- Smooth camera controls
- Environment mapping (sunset preset)
- Multiple point lights for ambiance

### ProductGallery3D
Product grid with:
- 3D preview cards
- Auto-rotating on hover
- Category badges
- 3D model indicator
- Responsive grid layout

## How to Add 3D Models

### Option 1: Upload via Admin Panel
1. Go to your admin dashboard
2. Edit a product
3. Upload a `.glb` or `.gltf` file
4. Save the product
5. The 3D viewer will automatically load the model

### Option 2: Direct API Upload
```bash
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@model.glb"
```

Then save the returned URL in the product's `model3D` field.

## 3D Model Sources

### Free Model Websites
1. **Sketchfab** (https://sketchfab.com)
   - Search for perfume bottles, products
   - Download as .glb format
   - Free and paid models

2. **TurboSquid** (https://www.turbosquid.com)
   - High-quality 3D models
   - Free tier available

3. **CGTrader** (https://www.cgtrader.com)
   - Marketplace for 3D models
   - Many free options

4. **OpenAI Shap-E** (https://huggingface.co/openai/shap-e)
   - AI-generated 3D models
   - Text-to-3D capability

### Creating Your Own Models
- **Blender** (Free) - Industry standard 3D software
- **TinkerCAD** (Free) - Browser-based 3D design
- **Maya** (Paid) - Professional 3D creation
- **Cinema 4D** (Paid) - Advanced rendering

## Exporting to GLB/GLTF

### From Blender
1. File → Export As → glTF 2.0 (.glb/.gltf)
2. Choose GLB (binary) for better performance
3. Export settings:
   - Format: GLB (Binary)
   - Include: Geometry, Materials, Textures, Animations
   - Save

### Optimization Tips
- Keep file size under 5MB
- Use compressed textures
- Bake lighting if possible
- Remove unnecessary geometry
- Use texture atlasing

## Testing Locally

### Test the 3D Viewer
1. Start your development server:
```bash
npm run dev  # in frontend
npm run dev  # in backend (separate terminal)
```

2. Go to http://localhost:3000
3. Hover over products to see auto-rotating preview
4. Click a product to view full 3D detail page
5. Drag to rotate, scroll to zoom

### Add a Test Model
For demo purposes, use any `.glb` file from Sketchfab:

```bash
# Download a model
curl -o bottle.glb "https://example-sketchfab-model.glb"

# Upload via API (need JWT token)
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer <admin_token>" \
  -F "file=@bottle.glb"
```

Then update your product:
```javascript
// Update product in data.json or via API
{
  "id": "product-id",
  "name": "My Product",
  "model3D": "http://localhost:5000/uploads/bottle-uuid.glb",
  // ... other fields
}
```

## Browser Compatibility

✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
⚠️ Mobile browsers (works but may need optimization)

## Performance Optimization

### For Production
1. **Compress models** - Use Gltf-Transform
   ```bash
   npx gltf-transform compress model.glb model-compressed.glb
   ```

2. **Enable CDN** - Serve models from CloudFront/S3
3. **Lazy loading** - Load 3D canvas on scroll
4. **Reduce geometry** - Decimate meshes for web
5. **Cache models** - Use service workers

### Code Example - Lazy Load 3D
```jsx
'use client'
import dynamic from 'next/dynamic'

const ProductViewer3DEnhanced = dynamic(
  () => import('@/components/ProductViewer3DEnhanced'),
  { ssr: false }
)

export default function Page() {
  return <ProductViewer3DEnhanced {...props} />
}
```

## Customization

### Change Lighting
Edit `ProductViewer3DEnhanced.jsx`:
```jsx
<ambientLight intensity={0.5} />  // Change intensity
<directionalLight position={[5, 5, 5]} intensity={1} />  // Change angle
```

### Change Colors
```jsx
<meshStandardMaterial
  color="#cfa57f"  // Change this hex color
  roughness={0.4}   // Change surface roughness
  metalness={0.1}   // Change metallic appearance
/>
```

### Change Animation Speed
```jsx
<OrbitControls
  autoRotateSpeed={4}  // Change this value (higher = faster)
  rotateSpeed={0.5}    // Drag rotation speed
  zoomSpeed={1.2}      // Zoom sensitivity
/>
```

## Troubleshooting

### Model not loading
- Check file format (must be .glb or .gltf)
- Verify URL is accessible
- Check browser console for errors
- Ensure CORS is enabled on backend

### Poor performance
- Reduce model complexity
- Use compressed textures
- Lower camera quality (reduce `dpr`)
- Disable environment mapping

### Model appears too small/large
- Adjust `scale` prop in viewer component
- Or scale model in Blender before exporting

## Next Steps

1. Find or create a 3D model of your product
2. Export as `.glb` format
3. Upload to your store
4. Share product link with customers
5. Watch engagement increase! 🚀

---

**Need help?** Check Sketchfab tutorials or Blender documentation.
