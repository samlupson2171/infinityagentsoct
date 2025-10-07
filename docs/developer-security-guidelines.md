# Developer Security Guidelines

## Overview

This document provides comprehensive security guidelines for developers working on the Infinity Weekends project. Following these guidelines ensures that sensitive information remains secure and the codebase maintains high security standards.

## 🔐 Credential Management

### ✅ DO: Secure Practices

**Use Environment Variables for All Sensitive Data:**
```javascript
// ✅ CORRECT - Use environment variables
const mongoUri = process.env.MONGODB_URI;
const apiKey = process.env.OPENAI_API_KEY;
const secret = process.env.NEXTAUTH_SECRET;
```

**Validate Environment Variables at Startup:**
```javascript
// ✅ CORRECT - Validate required variables
const requiredVars = ['MONGODB_URI', 'NEXTAUTH_SECRET'];
const missingVars = requiredVars.filter(var => !process.env[var]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
```

**Use Secure Placeholder Values in Documentation:**
```env
# ✅ CORRECT - Clear placeholders
MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/<DATABASE_NAME>
OPENAI_API_KEY=sk-<YOUR_OPENAI_API_KEY_HERE>
RESEND_API_KEY=re_<YOUR_RESEND_API_KEY_HERE>
```

### ❌ DON'T: Insecure Practices

**Never Hardcode Credentials:**
```javascript
// ❌ WRONG - Hardcoded credentials
const mongoUri = "mongodb+srv://user:password123@cluster.mongodb.net/db";
const apiKey = "sk-1234567890abcdef";
```

**Never Commit Real Credentials:**
```env
# ❌ WRONG - Real credentials in version control
MONGODB_URI=mongodb+srv://[NEVER-DO-THIS]:[ACTUAL-PASSWORD]@cluster.mongodb.net/db
OPENAI_API_KEY=sk-proj-[NEVER-COMMIT-REAL-KEYS]
```

**Avoid Ambiguous Placeholders:**
```env
# ❌ WRONG - Could be mistaken for real credentials
MONGODB_URI=mongodb+srv://[UNCLEAR-PLACEHOLDER]:[UNCLEAR-PLACEHOLDER]@cluster.mongodb.net/db
API_KEY=[UNCLEAR-PLACEHOLDER]
```

## 🗂️ File Management

### Environment Files

**File Types and Usage:**
- `.env.local` - Local development credentials (NEVER commit)
- `.env.production` - Production credentials (NEVER commit)
- `.env.example` - Template with placeholders (SAFE to commit)

**Verification Checklist:**
```bash
# ✅ Verify .gitignore excludes sensitive files
grep -E "\.env\.local|\.env\.production|\.env$" .gitignore

# ✅ Check .env.example contains only placeholders
grep -v "^#" .env.example | grep -E "(password|secret|key)" | head -5
```

### Documentation Security

**Safe Documentation Patterns:**
```markdown
<!-- ✅ CORRECT - Clear placeholder with instructions -->
Set your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/<DATABASE_NAME>
```

Replace `<YOUR_USERNAME>`, `<YOUR_PASSWORD>`, etc. with your actual values.
```

**Unsafe Documentation Patterns:**
```markdown
<!-- ❌ WRONG - Looks like real credentials -->
Set your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://[LOOKS-LIKE-REAL-CREDS]:[AVOID-THIS-PATTERN]@cluster.mongodb.net/mydb
```
```

## 🔍 Security Validation

### Pre-Commit Checks

**Run Security Scan Before Committing:**
```bash
# Check for credential exposures
node scripts/scan-credentials.js

# Validate environment configuration
node check-env.js

# Run tests to ensure security measures work
npm test
```

### Regular Security Audits

**Weekly Security Tasks:**
1. Run credential scanner: `node scripts/scan-credentials.js`
2. Review new dependencies for vulnerabilities
3. Check for new environment variables that need documentation
4. Verify .gitignore is up to date

**Monthly Security Tasks:**
1. Update API keys and rotate secrets
2. Review access logs for unusual activity
3. Update security documentation
4. Audit user permissions and access levels

## 🚨 Common Security Issues and Solutions

### Issue 1: Accidental Credential Commit

**Problem:** Committed real credentials to version control

**Immediate Actions:**
1. **DO NOT** just delete the file in a new commit
2. Remove credentials from git history:
   ```bash
   # Remove file from git history (use with caution)
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.local' --prune-empty --tag-name-filter cat -- --all
   ```
3. Rotate all exposed credentials immediately
4. Update .gitignore to prevent future occurrences

**Prevention:**
- Use pre-commit hooks
- Regular security scans
- Team training on secure practices

### Issue 2: Environment Variable Not Found

**Problem:** Application fails due to missing environment variables

**Solution:**
```javascript
// ✅ Implement graceful error handling
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    console.error(`Please add ${name} to your .env.local file`);
    console.error(`See .env.example for the required format`);
    process.exit(1);
  }
  return value;
}

const mongoUri = getRequiredEnvVar('MONGODB_URI');
```

### Issue 3: Insecure API Key Storage

**Problem:** API keys stored in client-side code

**Solution:**
```javascript
// ❌ WRONG - Client-side API key exposure
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Exposed to browser!

// ✅ CORRECT - Server-side only
// In API route or server component
const apiKey = process.env.API_KEY; // Server-side only
```

## 🛠️ Security Tools

### Available Security Tools

1. **Credential Scanner** (`scripts/scan-credentials.js`)
   - Detects hardcoded credentials
   - Generates security reports
   - Provides fix recommendations

2. **Environment Validator** (`src/lib/environment-validator.ts`)
   - Validates required environment variables
   - Checks for credential safety
   - Provides helpful error messages

3. **Startup Validator** (`src/lib/startup-validator.ts`)
   - Application initialization checks
   - Environment configuration validation
   - Feature availability checks

### Using Security Tools

**Daily Development Workflow:**
```bash
# Before starting development
node check-env.js

# Before committing changes
node scripts/scan-credentials.js

# Before deploying
npm run build && npm test
```

## 📋 Security Checklist

### Before Each Commit
- [ ] Run credential scanner
- [ ] Verify no .env.local or .env.production files are staged
- [ ] Check that new environment variables are documented in .env.example
- [ ] Ensure all API calls use environment variables for credentials

### Before Each Deployment
- [ ] Verify all required environment variables are set in production
- [ ] Test application startup with production-like environment
- [ ] Confirm no debug information exposes sensitive data
- [ ] Validate SSL/TLS certificates are current

### Monthly Security Review
- [ ] Rotate API keys and secrets
- [ ] Review and update .gitignore
- [ ] Audit user access and permissions
- [ ] Update security documentation
- [ ] Review dependency vulnerabilities

## 🆘 Incident Response

### If Credentials Are Exposed

**Immediate Actions (within 1 hour):**
1. Rotate all exposed credentials
2. Remove credentials from version control history
3. Notify team members
4. Monitor for unauthorized access

**Follow-up Actions (within 24 hours):**
1. Conduct security audit
2. Update security procedures
3. Document lessons learned
4. Implement additional safeguards

### Reporting Security Issues

**Internal Issues:**
- Create security incident ticket
- Notify security team immediately
- Document timeline and impact

**External Vulnerabilities:**
- Follow responsible disclosure
- Document and track resolution
- Update security measures

## 📚 Additional Resources

### Security Best Practices Documentation
- [Security Best Practices](./security-best-practices.md)
- [Environment Setup Guide](../DEPLOYMENT_GUIDE.md)
- [API Security Guidelines](./api-security-guidelines.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Guidelines](https://nextjs.org/docs/advanced-features/security-headers)

### Tools and Services
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk Security](https://snyk.io/)

## 🎯 Quick Reference

### Environment Variable Naming
```env
# Database connections
MONGODB_URI=mongodb+srv://...

# API Keys (service-specific prefixes)
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
CLAUDE_API_KEY=sk-ant-...

# Authentication secrets
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Email configuration
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
```

### Common Commands
```bash
# Security scan
node scripts/scan-credentials.js

# Environment validation
node check-env.js

# Test security measures
npm test -- --grep="security"

# Check git status for sensitive files
git status --ignored
```

### Emergency Contacts
- **Security Team:** [security@infinityweekends.com]
- **DevOps Team:** [devops@infinityweekends.com]
- **Project Lead:** [lead@infinityweekends.com]

---

**Remember:** Security is everyone's responsibility. When in doubt, ask for help rather than risk exposing sensitive information.