# Deployment Guide - Vercel

This guide will help you deploy the Penilaian360 application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A Supabase project with the following credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment Steps

### 1. Push Your Code to Git

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket):

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will automatically detect Next.js configuration

### 3. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**How to add environment variables:**
1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development** environments
3. Click **Save**

### 4. Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your application
3. Once complete, you'll receive a production URL (e.g., `your-app.vercel.app`)

### 5. Verify Deployment

After deployment, verify that:
- ✅ The application loads correctly
- ✅ Authentication works (Supabase connection)
- ✅ All pages are accessible
- ✅ No console errors

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

## Custom Domain (Optional)

To add a custom domain:
1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS records as instructed by Vercel

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active and accessible
- Review Supabase RLS (Row Level Security) policies

### Performance Issues
- Enable Vercel Analytics in project settings
- Review Core Web Vitals metrics
- Optimize images using Next.js Image component

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
