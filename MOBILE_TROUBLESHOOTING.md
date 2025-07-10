# Mobile Troubleshooting Guide

## Issue 1: Squarespace Maintenance Page on Mobile

### Problem
Users see a Squarespace maintenance page instead of your site on mobile devices.

### Root Cause
This is typically caused by DNS configuration issues where the domain is still pointing to Squarespace instead of Netlify.

### Solution Steps

#### 1. Check Current DNS Configuration
```bash
# Check where your domain is pointing
dig autismserviceslocator.com
dig www.autismserviceslocator.com
```

#### 2. Update DNS Records in Your Domain Registrar
You need to update your DNS records to point to Netlify:

**A Records:**
- `autismserviceslocator.com` → `75.2.60.5`
- `www.autismserviceslocator.com` → `75.2.60.5`

**CNAME Records:**
- `www.autismserviceslocator.com` → `autismserviceslocator.netlify.app`

#### 3. Verify Netlify Configuration
1. Go to your Netlify dashboard
2. Navigate to Site Settings > Domain Management
3. Ensure your custom domain is properly configured
4. Check that SSL certificate is active

#### 4. Clear DNS Cache
After updating DNS, it can take up to 48 hours for changes to propagate. You can:
- Clear your browser cache
- Try accessing from a different network
- Use a DNS lookup tool to verify propagation

## Issue 2: Google Reviews Not Showing on Mobile

### Problem
Google reviews work on desktop but not on mobile devices.

### Solutions

#### 1. Check Network Connectivity
Visit `/mobile-debug` on your mobile device to run network tests.

#### 2. Verify Proxy Server
Make sure the proxy server is running:
```bash
curl http://localhost:3001/api/health
```

#### 3. Check API Key Restrictions
Ensure your Google API key allows:
- Server-side requests (not just HTTP referrers)
- Your production domain: `autismserviceslocator.com`

#### 4. Mobile-Specific Debugging
1. Open browser developer tools on mobile
2. Check for CORS errors in the console
3. Verify network requests are completing
4. Check for timeout errors

#### 5. Browser Compatibility
- Try Chrome or Safari on mobile
- Clear browser cache and cookies
- Disable ad blockers temporarily

## Issue 3: Service Worker Caching Issues

### Problem
Old cached content is served instead of fresh content.

### Solution
1. Clear browser cache and storage
2. Visit `/clear-cache.html` to clear service worker cache
3. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)

## Issue 4: SSL Certificate Issues

### Problem
Mobile browsers show certificate warnings or errors.

### Solution
1. Verify SSL certificate is valid in Netlify
2. Check that certificate covers both `www` and non-`www` domains
3. Ensure no mixed content (HTTP/HTTPS) issues

## Testing Checklist

### For Mobile Reviews:
- [ ] Proxy server is running on port 3001
- [ ] Google API key is valid and unrestricted
- [ ] Network connectivity is stable
- [ ] No CORS errors in console
- [ ] Timeout is set to 60 seconds
- [ ] Mobile debug test passes

### For Squarespace Maintenance Page:
- [ ] DNS records point to Netlify
- [ ] SSL certificate is active
- [ ] Domain is properly configured in Netlify
- [ ] DNS propagation is complete (up to 48 hours)

## Quick Fixes

### Immediate Actions:
1. **Restart proxy server:**
   ```bash
   pkill -f proxy-server
   node proxy-server.js
   ```

2. **Clear mobile browser cache:**
   - Settings → Privacy → Clear browsing data
   - Select "All time" and clear all data

3. **Test on different mobile browsers:**
   - Chrome
   - Safari
   - Firefox

4. **Check mobile debug page:**
   - Visit `/mobile-debug` on your mobile device
   - Run the diagnostic tests
   - Share results if issues persist

## Contact Information
If issues persist after trying these solutions, please provide:
- Screenshot of the error
- Mobile debug test results
- Browser and device information
- Network type (WiFi/Cellular) 