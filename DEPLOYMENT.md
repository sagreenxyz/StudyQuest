# Deployment Guide

This guide covers how to deploy StudyQuest to various platforms.

## Netlify (Recommended)

StudyQuest is optimized for Netlify deployment with automatic builds and deployments.

### Automatic Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy automatically on every push to main branch

### Manual Deployment

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify:
   - Drag and drop the `dist` folder to Netlify's deploy interface
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

## GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```
3. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

## Custom Server

For custom server deployment:

1. Build the project: `npm run build`
2. Serve the `dist` directory with any static file server
3. Ensure proper routing for SPA (Single Page Application)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache Configuration

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables

StudyQuest runs entirely in the browser and doesn't require server-side environment variables. All data is stored in localStorage.

## Performance Optimization

For production deployments:

1. Enable gzip compression
2. Set proper cache headers for static assets
3. Use a CDN for better global performance
4. Enable HTTP/2 if possible

## Monitoring

Consider adding:
- Error tracking (e.g., Sentry)
- Analytics (e.g., Google Analytics)
- Performance monitoring
- Uptime monitoring

## Security Headers

Add these security headers for production:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Troubleshooting

### Common Issues

1. **Blank page after deployment**: Check browser console for errors, ensure all assets are loading correctly
2. **Routing issues**: Ensure SPA routing is configured properly on your server
3. **Image loading issues**: Verify image URLs are accessible and CORS is configured if needed

### Support

If you encounter deployment issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure the build process completes successfully
4. Check server logs for any errors