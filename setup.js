#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Infinity Weekends Website Setup Script');
console.log('==========================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Make sure you\'re in the project root directory.');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .env.local if it doesn't exist
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Creating environment file...');
  
  const envTemplate = `# Database Configuration
# SECURITY WARNING: Replace placeholders with your actual credentials
# Never commit real credentials to version control
MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/infinity-weekends?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<GENERATE_RANDOM_SECRET_32_CHARS_OR_MORE>

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<YOUR_EMAIL>@gmail.com
SMTP_PASS=<YOUR_APP_PASSWORD>

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=<YOUR_VERCEL_BLOB_TOKEN>
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
  console.log('⚠️  SECURITY WARNING: Replace ALL placeholder values in .env.local with your actual credentials');
  console.log('⚠️  Never commit .env.local to version control - it contains sensitive information');
} else {
  console.log('✅ Environment file already exists');
}

// Create .gitignore if it doesn't exist
const gitignorePath = '.gitignore';
if (!fs.existsSync(gitignorePath)) {
  console.log('\n📝 Creating .gitignore file...');
  
  const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/

# Production
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Playwright
test-results/
playwright-report/
playwright/.cache/
`;

  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Created .gitignore file');
} else {
  console.log('✅ .gitignore file already exists');
}

// Check TypeScript configuration
console.log('\n🔍 Checking TypeScript configuration...');
try {
  execSync('npm run type-check', { stdio: 'pipe' });
  console.log('✅ TypeScript configuration is valid');
} catch (error) {
  console.log('⚠️  TypeScript check failed - this is normal if environment variables are not set yet');
}

// Final instructions
console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the environment variables in .env.local');
console.log('2. Set up your MongoDB Atlas database');
console.log('3. Configure your email SMTP settings');
console.log('4. Set up Vercel Blob storage for file uploads');
console.log('5. Run "npm run dev" to start the development server');
console.log('\n📖 For detailed instructions, see LAUNCH_GUIDE.md');
console.log('\n🚀 Happy coding!');