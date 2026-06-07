# VlogApp Deployment Guide for Vercel

## 📊 Folder Size Analysis
- **Largest folders:**
  - `.next/` - 610 MB (build cache - excluded from deployment)
  - `node_modules/` - 429 MB (dependencies - excluded from deployment)
  - **Actual deployment size**: ~1 MB (source code only)

## 🚀 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**: `Milind1234-cpu/vlogging-app`
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `next build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

6. **Add Environment Variables** (click "Environment Variables"):
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

7. **Click "Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to set up your project
```

## 🔑 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vlogapp` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployed URL | `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

## 📝 Post-Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to your Vercel deployment URL
- [ ] Test authentication flow (login/register)
- [ ] Test video upload functionality
- [ ] Verify MongoDB connection
- [ ] Test theme toggle (light/dark mode)
- [ ] Check all API routes are working
- [ ] Verify Cloudinary video uploads

## 🔧 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Verify MongoDB URI is accessible from Vercel's servers
- Check build logs in Vercel dashboard

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check MongoDB connection

### Video Upload Fails
- Verify Cloudinary credentials
- Check API key permissions in Cloudinary dashboard
- Ensure upload preset is configured

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 Your Project is Ready!

Once deployed, your VlogApp will be live at:
`https://your-project-name.vercel.app`

Vercel will automatically:
- ✅ Build and deploy on every push to `main`
- ✅ Generate preview deployments for pull requests
- ✅ Provide SSL certificate (HTTPS)
- ✅ CDN distribution worldwide
- ✅ Automatic scaling
