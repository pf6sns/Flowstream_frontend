# AWS Amplify Deployment Guide

## Required Environment Variables

Set these in **AWS Amplify Console** → Your App → **Environment variables**:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB_NAME` | Database name | `Flowstream` |

### Recommended Variables (Security)

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `JWT_SECRET` | Secret key for JWT tokens | Use a long random string (32+ characters) |
| `ENCRYPTION_KEY` | Key for encrypting sensitive data | Use a long random string (32+ characters) |
| `NODE_ENV` | Environment mode | `production` (no quotes, lowercase) |

## How to Set Environment Variables in AWS Amplify

1. Go to **AWS Amplify Console**
2. Select your app: `main.d26k600kuo9e7u.amplifyapp.com`
3. Click **App settings** (left sidebar)
4. Click **Environment variables**
5. Click **Manage variables**
6. Add each variable:
   - Click **Add variable**
   - Enter **Key** (e.g., `MONGODB_URI`)
   - Enter **Value** (your actual value)
   - Click **Save**
7. **Redeploy** your app after adding variables:
   - Go to **App settings** → **Build settings**
   - Click **Redeploy this version** or push a new commit

## MongoDB Connection Setup

### 1. Verify MongoDB Atlas Network Access

1. Go to **MongoDB Atlas** → Your Cluster → **Network Access**
2. Add IP Address: `0.0.0.0/0` (allows all IPs) OR add AWS Amplify IP ranges
3. Click **Confirm**

### 2. Get Your Connection String

1. Go to **MongoDB Atlas** → Your Cluster → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add database name if needed: `mongodb+srv://user:pass@cluster.mongodb.net/Flowstream`

### 3. Test Connection String Format

Your `MONGODB_URI` should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Or with database name:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Flowstream?retryWrites=true&w=majority
```

## Generate Secure Keys

### Generate JWT_SECRET
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Generate ENCRYPTION_KEY
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Viewing Logs in AWS Amplify

To see the actual error causing the 500:

1. Go to **AWS Amplify Console** → Your App
2. Click **Monitoring** (left sidebar)
3. Click **View logs**
4. Filter by:
   - **Function logs** (for API routes)
   - **Build logs** (for build errors)
5. Look for errors mentioning:
   - `MONGODB_URI`
   - `MongoClient`
   - `Connection failed`
   - `Environment variable`

## Common Issues & Solutions

### Issue 1: "Please add your Mongo URI to .env.local"
**Cause:** `MONGODB_URI` not set in Amplify  
**Solution:** Add `MONGODB_URI` in Amplify Environment variables

### Issue 2: "MongoServerError: Invalid namespace"
**Cause:** `MONGODB_DB_NAME` has leading/trailing spaces  
**Solution:** Set `MONGODB_DB_NAME` to `Flowstream` (no spaces)

### Issue 3: "Connection timeout" or "Network error"
**Cause:** MongoDB Atlas not allowing AWS IPs  
**Solution:** Add `0.0.0.0/0` to MongoDB Atlas Network Access

### Issue 4: "Authentication failed"
**Cause:** Wrong MongoDB username/password in connection string  
**Solution:** Verify credentials in MongoDB Atlas → Database Access

### Issue 5: Cookie not working
**Cause:** `secure: true` requires HTTPS, but domain mismatch  
**Solution:** Ensure `NODE_ENV=production` is set (cookies work correctly)

### Issue 6: "Non-standard NODE_ENV value" warning
**Cause:** `NODE_ENV` set to wrong value (e.g., "Production", "PRODUCTION", or with quotes)  
**Solution:** Set `NODE_ENV` to exactly `production` (lowercase, no quotes) in Amplify

### Issue 7: Build fails with "Cannot read properties of null (reading 'useContext')"
**Cause:** `global-error.tsx` using React hooks during static generation  
**Solution:** Fixed in code - ensure latest version is deployed

## Verification Checklist

After setting environment variables:

- [ ] `MONGODB_URI` is set and correct
- [ ] `MONGODB_DB_NAME` is set to `Flowstream` (no spaces)
- [ ] `JWT_SECRET` is set (long random string)
- [ ] `ENCRYPTION_KEY` is set (long random string)
- [ ] `NODE_ENV` is set to `production`
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0` or AWS IPs
- [ ] App has been redeployed after adding variables
- [ ] Checked logs for any errors

## Testing After Deployment

1. Try logging in with your admin credentials
2. If it fails, check Amplify logs for the exact error
3. Verify all environment variables are set correctly
4. Ensure MongoDB connection string is valid

## Quick Fix Command

If you have AWS CLI configured, you can set variables via CLI:

```bash
aws amplify update-app --app-id YOUR_APP_ID --environment-variables \
  MONGODB_URI="your-uri" \
  MONGODB_DB_NAME="Flowstream" \
  JWT_SECRET="your-secret" \
  ENCRYPTION_KEY="your-key" \
  NODE_ENV="production"
```
