# Vercel Production Deployment Guide

This guide will walk you through deploying your social project to Vercel production.

## Prerequisites

- [x] Vercel account (logged in as: bao-5318)
- [x] Supabase database configured
- [x] Backend and frontend working locally
- [x] Database migrations created

## Deployment Steps

### Step 1: Deploy Backend to Vercel

The backend will be deployed as a serverless function.

```bash
cd packages/backend
vercel --prod
```

**What to expect:**
- Vercel will detect your configuration from `vercel.json`
- It will build your backend using the build script
- You'll get a production URL like: `https://your-backend.vercel.app`

**Important:** Save the backend URL - you'll need it for the frontend!

### Step 2: Configure Backend Environment Variables

After deploying, you need to add environment variables to Vercel:

```bash
# Add environment variables via CLI
vercel env add DATABASE_URL production
vercel env add POSTGRES_URL production
vercel env add JWT_SECRET production
vercel env add CORS_ORIGIN production
vercel env add NODE_ENV production
```

Or use the Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your Supabase connection string | Same as in .env |
| `POSTGRES_URL` | Your Supabase connection string | Same as DATABASE_URL |
| `JWT_SECRET` | Strong random secret | Use: `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Update after frontend deploy |
| `NODE_ENV` | `production` | |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Update after frontend deploy |

### Step 3: Redeploy Backend (after adding env vars)

```bash
vercel --prod
```

This ensures the environment variables are used in the build.

### Step 4: Run Database Migrations in Production

Your database already has the schema from local development, but if you need to run migrations on a fresh database:

```bash
# Set DATABASE_URL temporarily to production database
export DATABASE_URL="your_supabase_connection_string"
npm run db:migrate
npm run db:seed  # Optional: add seed data
```

### Step 5: Deploy Frontend to Vercel

```bash
cd ../frontend
vercel --prod
```

**What to expect:**
- Vercel will detect Next.js automatically
- You'll get a production URL like: `https://your-frontend.vercel.app`

### Step 6: Configure Frontend Environment Variables

Add the backend URL to your frontend:

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

Value should be your backend URL from Step 1:
```
https://your-backend.vercel.app
```

Or use the Vercel Dashboard:
1. Go to your frontend project
2. Settings → Environment Variables
3. Add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Social Project` |

### Step 7: Update Backend CORS Settings

Now that you have the frontend URL, update the backend CORS:

```bash
cd packages/backend
vercel env add CORS_ORIGIN production
# Enter: https://your-frontend.vercel.app

vercel env add FRONTEND_URL production
# Enter: https://your-frontend.vercel.app

# Redeploy to apply changes
vercel --prod
```

### Step 8: Redeploy Frontend

```bash
cd ../frontend
vercel --prod
```

### Step 9: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try to register a new user
3. Login with test credentials:
   - Username: `sarah_wilson`
   - Password: `password123`
4. Test creating posts and comments
5. Check that all features work

## Quick Deploy Commands

For future updates, you can deploy both services quickly:

```bash
# Deploy backend
cd packages/backend && vercel --prod

# Deploy frontend
cd packages/frontend && vercel --prod
```

## Environment Variable Summary

### Backend (.env in Vercel)
```env
NODE_ENV=production
DATABASE_URL=postgres://postgres.xxx@xxx.supabase.com:6543/postgres?sslmode=require
POSTGRES_URL=postgres://postgres.xxx@xxx.supabase.com:6543/postgres?sslmode=require
JWT_SECRET=your_secure_random_secret_key_here
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env in Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_APP_NAME=Social Project
```

## Troubleshooting

### Issue: CORS errors in production
**Solution:** Make sure `CORS_ORIGIN` and `FRONTEND_URL` in backend match your frontend URL exactly (including https://)

### Issue: Database connection errors
**Solution:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check Supabase connection pooler is enabled
- Ensure `?sslmode=require` is in the connection string

### Issue: "Module not found" errors
**Solution:**
- Make sure `npm run build` works locally first
- Check that all dependencies are in `dependencies`, not `devDependencies`
- Verify `tsc-alias` and build scripts are configured correctly

### Issue: Environment variables not working
**Solution:**
- Redeploy after adding environment variables
- Make sure production environment is selected when adding vars
- Clear build cache: `vercel --prod --force`

## Monitoring and Logs

View logs in Vercel Dashboard:
1. Go to your project
2. Click on a deployment
3. View "Functions" tab to see serverless function logs
4. Check "Build Logs" for build issues

## Custom Domains (Optional)

To add a custom domain:
1. Go to project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` and `FRONTEND_URL` to use your custom domain

## Rollback

If something goes wrong:
1. Go to Vercel Dashboard → Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Security Checklist

- [ ] Changed `JWT_SECRET` to a strong random value
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] CORS is configured to only allow your frontend domain
- [ ] Sensitive data not committed to git (check `.env` files)
- [ ] Production environment variables set in Vercel (not in code)

## Performance Tips

1. **Enable Edge Caching**: Add cache headers to API responses
2. **Use Connection Pooling**: Your Supabase pooler is already configured
3. **Monitor Function Duration**: Keep serverless functions under 10s
4. **Optimize Images**: Use Next.js Image component

## Next Steps

After successful deployment:
1. Set up monitoring (Vercel Analytics)
2. Configure alerts for errors
3. Set up CI/CD with GitHub integration
4. Add staging environment
5. Configure custom domains

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: Create an issue in your repository
