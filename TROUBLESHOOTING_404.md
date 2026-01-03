# Troubleshooting 404 Errors in Next.js

## Common Causes and Solutions

### 1. Clear Browser Cache
- **Chrome/Edge**: Press `Ctrl + Shift + Delete`, select "Cached images and files", clear
- **Firefox**: Press `Ctrl + Shift + Delete`, select "Cache", clear
- Or use **Hard Refresh**: `Ctrl + F5` or `Ctrl + Shift + R`

### 2. Restart Development Server
```bash
# Stop all Node processes
Get-Process -Name node | Stop-Process -Force

# Clear Next.js cache
Remove-Item -Path .next -Recurse -Force

# Restart dev server
npm run dev
```

### 3. Check if Server is Running
- Open browser to: http://localhost:3000
- Check terminal for any errors
- Wait 10-15 seconds after starting server for initial build

### 4. Verify Port Availability
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### 5. Check Environment
- Ensure `.env.local` exists with correct `NEXT_PUBLIC_API_URL`
- Verify Node.js version: `node --version` (should be 18+)
- Reinstall dependencies if needed: `rm -rf node_modules && npm install`

### 6. File Structure
Ensure these files exist:
- `app/layout.js` - Root layout
- `app/page.js` - Home page
- `app/globals.css` - Global styles

### 7. Next.js Configuration
Check `next.config.js` is valid and doesn't have syntax errors.

## If Issues Persist

1. **Complete Clean Rebuild**:
   ```bash
   Remove-Item -Path .next,node_modules -Recurse -Force
   npm install
   npm run dev
   ```

2. **Check Console Errors**: 
   - Open browser DevTools (F12)
   - Check Console and Network tabs
   - Look for specific error messages

3. **Try Different Port**:
   ```bash
   npm run dev -- -p 3001
   ```
   Then access http://localhost:3001








