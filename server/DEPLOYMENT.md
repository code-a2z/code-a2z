# 🚀 Vercel Deployment Guide for TypeScript Backend

## Pre-Deployment Checklist

✅ **TypeScript Compilation**: `npm run build` succeeds with 0 errors
✅ **Entry Point**: `index.ts` exports Express app (no listen in production)
✅ **Vercel Config**: `vercel.json` properly configured
✅ **Dependencies**: All @types packages installed
✅ **Environment Variables**: All required vars documented

## Environment Variables Required

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables
```
PORT=8000
NODE_ENV=production
MONGODB_URL=<your-mongodb-connection-string>
JWT_SECRET_ACCESS_KEY=<your-secure-access-key>
JWT_SECRET_REFRESH_KEY=<your-secure-refresh-key>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Optional Variables (with defaults)
```
SERVER_ENV=production
VITE_SERVER_DOMAIN=<your-server-url>
VITE_CLIENT_DOMAIN=<your-client-url>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
ADMIN_EMAIL=<admin-email>
RESEND_API_KEY=<resend-api-key>
```

## Vercel Configuration

**File**: `server/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

## Build Settings in Vercel

1. **Framework Preset**: Other
2. **Root Directory**: `server`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`
6. **Node Version**: 18.x or higher

## Deployment Steps

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd server
vercel --prod
```

### Option 2: Git Integration

1. Push to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Set root directory to `server`
4. Configure environment variables
5. Deploy

## Post-Deployment Verification

### 1. Check Health Endpoint
```bash
curl https://your-domain.vercel.app
# Expected: {"status":"success","message":"Backend is running..."}
```

### 2. Check Monitor Endpoint
```bash
curl https://your-domain.vercel.app/monitor/health
# Expected: {"status":"healthy","uptime":<seconds>,"database":"connected"}
```

### 3. Test API Endpoints
```bash
# Test authentication
curl -X POST https://your-domain.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test User","email":"test@example.com","password":"Test123"}'
```

## Troubleshooting

### Build Fails

**Problem**: TypeScript compilation errors
**Solution**:
```bash
cd server
npm run build
# Fix any errors shown
```

### Module Not Found

**Problem**: Missing dependencies
**Solution**:
```bash
npm install
npm run build
```

### Database Connection Fails

**Problem**: MongoDB connection string incorrect
**Solution**: 
- Verify MONGODB_URL in environment variables
- Ensure MongoDB Atlas allows Vercel IPs
- Check connection string format

### JWT Errors

**Problem**: Token verification fails
**Solution**:
- Verify JWT_SECRET_ACCESS_KEY is set
- Ensure JWT_SECRET_REFRESH_KEY is set
- Check token expiration settings

### CORS Issues

**Problem**: Frontend can't connect
**Solution**:
- Set VITE_CLIENT_DOMAIN in environment
- Verify CORS configuration in server.ts
- Check allowed origins

## Monitoring

### Vercel Dashboard
- View logs in Vercel Dashboard → Deployments → Logs
- Monitor function invocations
- Check error rates

### Application Logs
The backend uses Winston logging:
- Errors logged to console (viewable in Vercel)
- HTTP requests logged with Morgan

## Performance Tips

### Cold Starts
- First request after inactivity may be slow (~3-5s)
- Subsequent requests are fast (<100ms)
- Consider Vercel Pro for reduced cold starts

### Database Connection
- MongoDB connection is cached globally
- Reused across function invocations
- No connection pool exhaustion

### Rate Limiting
- Auth endpoints: Limited per IP
- General endpoints: Limited per IP
- Configured in middlewares

## Scaling

Vercel automatically scales based on:
- Request volume
- Geographic distribution
- Time of day

No manual scaling configuration needed.

## Security Checklist

✅ Environment variables in Vercel (not committed)
✅ HTTPS enforced by Vercel
✅ Rate limiting enabled
✅ Input sanitization active
✅ JWT authentication configured
✅ Helmet security headers enabled
✅ HPP protection enabled

## Cost Considerations

**Vercel Hobby Plan** (Free):
- 100GB bandwidth
- 100 function invocations per day
- 10s max execution time
- Good for development/testing

**Vercel Pro Plan** ($20/month):
- 1TB bandwidth
- Unlimited function invocations
- 60s max execution time
- Production ready

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: https://github.com/Code-A2Z/code-a2z/issues

---

✅ **Ready for Production Deployment!**
