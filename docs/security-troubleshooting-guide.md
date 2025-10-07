# Security Troubleshooting Guide

## Overview

This guide helps developers quickly identify and resolve common security-related issues in the Infinity Weekends project.

## 🚨 Common Issues and Solutions

### 1. "Missing required environment variable" Error

**Error Message:**
```
❌ Missing required environment variable: MONGODB_URI
Please add MONGODB_URI to your .env.local file
```

**Cause:** Required environment variable is not set

**Solution:**
1. **Check if .env.local exists:**
   ```bash
   ls -la .env.local
   ```

2. **If missing, create .env.local:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit .env.local with your actual credentials:**
   ```env
   MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/infinityweekends
   NEXTAUTH_SECRET=<YOUR_ACTUAL_SECRET_KEY_HERE>
   ```

4. **Verify the variable is loaded:**
   ```bash
   node -e "console.log(process.env.MONGODB_URI ? '✅ Set' : '❌ Missing')"
   ```

### 2. "Credential Security Issues Detected" Warning

**Error Message:**
```
🚨 Found 5 potential security issues
🔴 Critical: 1
```

**Cause:** Credential scanner found potential security issues

**Solution:**
1. **Run detailed scan:**
   ```bash
   node scripts/scan-credentials.js
   ```

2. **Review each issue:**
   - **Critical Issues:** Must be fixed immediately
   - **High Issues:** Review and fix if necessary
   - **False Positives:** Document as acceptable

3. **Common fixes:**
   ```javascript
   // ❌ Before: Hardcoded credential
   const uri = "mongodb+srv://[NEVER-HARDCODE]:[CREDENTIALS]@cluster.mongodb.net/db";
   
   // ✅ After: Environment variable
   const uri = process.env.MONGODB_URI;
   ```

### 3. "Database Connection Failed" Error

**Error Message:**
```
MongoDB connection error: MongoServerError: bad auth
```

**Cause:** Invalid credentials or connection string

**Solution:**
1. **Verify connection string format:**
   ```env
   # ✅ Correct format
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE>?retryWrites=true&w=majority
   ```

2. **Check credentials in MongoDB Atlas:**
   - Verify username and password are correct
   - Ensure user has proper database permissions
   - Check IP whitelist includes your IP

3. **Test connection manually:**
   ```bash
   node test-mongo-connection.js
   ```

### 4. "NextAuth Configuration Error"

**Error Message:**
```
[next-auth][error][INVALID_NEXTAUTH_SECRET]
```

**Cause:** Missing or invalid NEXTAUTH_SECRET

**Solution:**
1. **Generate a secure secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to .env.local:**
   ```env
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **For production, use different secret:**
   ```env
   # .env.production
   NEXTAUTH_SECRET=different-production-secret
   NEXTAUTH_URL=https://yourdomain.com
   ```

### 5. "API Key Invalid" Error

**Error Message:**
```
OpenAI API Error: Invalid API key
```

**Cause:** Missing, incorrect, or expired API key

**Solution:**
1. **Verify API key format:**
   ```env
   # OpenAI keys start with 'sk-'
   OPENAI_API_KEY=sk-proj-your-key-here
   
   # Resend keys start with 're_'
   RESEND_API_KEY=re_your-key-here
   ```

2. **Check API key validity:**
   - Log into service provider dashboard
   - Verify key is active and not expired
   - Check usage limits and quotas

3. **Test API key:**
   ```bash
   # Test OpenAI key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

### 6. "File Upload Security Error"

**Error Message:**
```
File type not allowed or security validation failed
```

**Cause:** Uploaded file fails security validation

**Solution:**
1. **Check allowed file types:**
   ```javascript
   const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
   ```

2. **Verify file size limits:**
   ```javascript
   const maxSize = 10 * 1024 * 1024; // 10MB
   ```

3. **Check file content validation:**
   - Ensure file headers match extensions
   - Verify no malicious content detected

### 7. "Environment Validation Failed"

**Error Message:**
```
❌ Environment validation failed
Multiple configuration issues detected
```

**Cause:** Multiple environment configuration problems

**Solution:**
1. **Run comprehensive check:**
   ```bash
   node check-env.js
   ```

2. **Fix issues one by one:**
   - Missing variables
   - Invalid formats
   - Security violations

3. **Verify all features work:**
   ```bash
   npm run dev
   # Test each feature manually
   ```

## 🔧 Diagnostic Commands

### Quick Health Check
```bash
# Check environment configuration
node check-env.js

# Scan for security issues
node scripts/scan-credentials.js

# Test database connection
node test-mongo-connection.js

# Verify all services
npm run build
```

### Detailed Diagnostics
```bash
# Check git status for sensitive files
git status --ignored

# Verify .gitignore is working
git check-ignore .env.local .env.production

# List environment variables (be careful!)
env | grep -E "(MONGODB|NEXTAUTH|API_KEY)" | sed 's/=.*/=***/'

# Check file permissions
ls -la .env*
```

## 🛠️ Recovery Procedures

### Credential Exposure Recovery

**If credentials were committed to git:**

1. **Immediate actions:**
   ```bash
   # Remove from current commit (if not pushed)
   git reset --soft HEAD~1
   git reset HEAD .env.local
   
   # If already pushed, remove from history
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
   ```

2. **Rotate all exposed credentials:**
   - MongoDB: Change database password
   - API Keys: Generate new keys
   - Secrets: Generate new secrets

3. **Update .gitignore:**
   ```bash
   echo ".env.local" >> .gitignore
   echo ".env.production" >> .gitignore
   git add .gitignore
   git commit -m "Update .gitignore to exclude env files"
   ```

### Database Connection Recovery

**If database connection is lost:**

1. **Check MongoDB Atlas status:**
   - Verify cluster is running
   - Check for maintenance windows
   - Review connection limits

2. **Verify network connectivity:**
   ```bash
   # Test DNS resolution
   nslookup your-cluster.mongodb.net
   
   # Test port connectivity
   telnet your-cluster.mongodb.net 27017
   ```

3. **Reset connection:**
   ```bash
   # Restart application
   npm run dev
   
   # Clear connection cache
   rm -rf .next/cache
   ```

## 📊 Monitoring and Alerts

### Security Monitoring

**Set up regular checks:**
```bash
# Add to crontab for daily security scan
0 9 * * * cd /path/to/project && node scripts/scan-credentials.js
```

**Monitor for:**
- New credential patterns in code
- Unusual API usage patterns
- Failed authentication attempts
- File upload anomalies

### Performance Monitoring

**Database performance:**
```javascript
// Monitor connection pool
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected - Pool size:', mongoose.connection.readyState);
});
```

**API rate limiting:**
```javascript
// Monitor API usage
const usage = await checkAPIUsage();
if (usage.remaining < 100) {
  console.warn('API quota running low:', usage);
}
```

## 🆘 Emergency Procedures

### Security Incident Response

**Level 1: Credential Exposure**
1. Rotate credentials immediately
2. Remove from version control
3. Monitor for unauthorized access
4. Document incident

**Level 2: Data Breach**
1. Isolate affected systems
2. Notify security team
3. Preserve evidence
4. Begin forensic analysis

**Level 3: System Compromise**
1. Take systems offline
2. Activate incident response team
3. Contact authorities if required
4. Begin recovery procedures

### Contact Information

**Emergency Contacts:**
- Security Team: security@infinityweekends.com
- DevOps Team: devops@infinityweekends.com
- Project Lead: lead@infinityweekends.com

**Service Providers:**
- MongoDB Atlas Support
- OpenAI Support
- Resend Support
- Vercel Support

## 📚 Additional Resources

### Documentation
- [Developer Security Guidelines](./developer-security-guidelines.md)
- [Security Best Practices](./security-best-practices.md)
- [Deployment Guide](../DEPLOYMENT_GUIDE.md)

### Tools
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/) for API testing
- [Git Secrets](https://github.com/awslabs/git-secrets)

### Learning Resources
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Remember:** When troubleshooting security issues, always err on the side of caution. If you're unsure about a security decision, consult with the security team before proceeding.