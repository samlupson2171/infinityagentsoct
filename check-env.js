#!/usr/bin/env node

console.log('🔍 Environment Variables Checker');
console.log('=================================\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Check if we can use the new validation system
let useNewValidator = false;
try {
  // Try to load the new validation system
  // Note: This will work when running through Next.js but may fail in standalone Node.js
  const { StartupValidator } = require('./src/lib/startup-validator.ts');
  useNewValidator = true;
  
  console.log('Using enhanced validation system...\n');
  
  // Run comprehensive validation
  const result = StartupValidator.validateEnvironmentGraceful();
  
  // Display detailed results
  console.log('Environment Validation Results:');
  console.log('==============================\n');
  
  // Required variables
  console.log('Required Variables:');
  console.log('------------------');
  result.report.requiredVariables.forEach(variable => {
    const status = variable.isValid ? '✅' : '❌';
    console.log(`${status} ${variable.variable}: ${variable.message}`);
  });
  
  // Optional variables (only show configured ones)
  const configuredOptional = result.report.optionalVariables.filter(v => 
    v.severity !== 'info' || v.message !== 'Optional variable not set'
  );
  
  if (configuredOptional.length > 0) {
    console.log('\nOptional Variables:');
    console.log('------------------');
    configuredOptional.forEach(variable => {
      const status = variable.isValid ? '✅' : (variable.severity === 'warning' ? '⚠️' : '❌');
      console.log(`${status} ${variable.variable}: ${variable.message}`);
    });
  }
  
  // Security checks
  const securityIssues = result.report.securityChecks.filter(check => !check.isSecure);
  if (securityIssues.length > 0) {
    console.log('\nSecurity Issues:');
    console.log('---------------');
    securityIssues.forEach(check => {
      console.log(`🚨 ${check.variable}: ${check.issues.join(', ')}`);
    });
  }
  
  // Feature availability
  console.log('\nFeature Availability:');
  console.log('--------------------');
  const features = StartupValidator.getFeatureStatus();
  Object.entries(features).forEach(([feature, available]) => {
    const status = available ? '✅' : '❌';
    const displayName = feature.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${displayName}: ${available ? 'Available' : 'Not configured'}`);
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: ${result.report.summary.passed}/${result.report.summary.totalChecked} variables configured correctly`);
  
  if (result.isValid) {
    console.log('🎉 All critical environment variables are properly configured!');
    console.log('You can now run "npm run dev" to start the development server.');
  } else {
    console.log('❌ Some critical environment variables need attention.');
    console.log('\nConfiguration Help:');
    const help = StartupValidator.getConfigurationHelp();
    help.forEach(line => console.log(line));
  }
  
} catch (error) {
  // Fallback to basic validation if new system isn't available
  console.log('Using basic validation system...\n');
  
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];

  const optionalVars = [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'OPENAI_API_KEY',
    'CLAUDE_API_KEY'
  ];

  let allGood = true;

  console.log('Required Environment Variables:');
  console.log('-------------------------------');

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'your-' + varName.toLowerCase().replace('_', '-') + '-here' && !value.includes('your-')) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing or using placeholder value`);
      allGood = false;
    }
  });

  console.log('\nOptional Environment Variables:');
  console.log('-------------------------------');

  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your-')) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`⚠️  ${varName}: Not set (optional for basic functionality)`);
    }
  });

  console.log('\nEnvironment Variable Validation:');
  console.log('--------------------------------');

  // Validate MongoDB URI
  if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      console.log('✅ MONGODB_URI: Valid format');
    } else {
      console.log('❌ MONGODB_URI: Invalid format (should start with mongodb:// or mongodb+srv://)');
      allGood = false;
    }
  }

  // Validate NextAuth URL
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.startsWith('http://') || process.env.NEXTAUTH_URL.startsWith('https://')) {
      console.log('✅ NEXTAUTH_URL: Valid format');
    } else {
      console.log('❌ NEXTAUTH_URL: Invalid format (should start with http:// or https://)');
      allGood = false;
    }
  }

  // Validate NextAuth Secret
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length >= 32) {
      console.log('✅ NEXTAUTH_SECRET: Adequate length');
    } else {
      console.log('❌ NEXTAUTH_SECRET: Too short (should be at least 32 characters)');
      allGood = false;
    }
  }

  // Validate SMTP Port
  if (process.env.SMTP_PORT) {
    const port = parseInt(process.env.SMTP_PORT);
    if (port > 0 && port <= 65535) {
      console.log('✅ SMTP_PORT: Valid port number');
    } else {
      console.log('❌ SMTP_PORT: Invalid port number');
      allGood = false;
    }
  }

  console.log('\nSecurity Validation:');
  console.log('-------------------');

  // Security checks for credential safety
  let securityIssues = 0;

  // Check for placeholder values that should be replaced
  const placeholderPatterns = [
    { var: 'MONGODB_URI', patterns: ['your-username', 'your-password', '<YOUR_', 'username:password'] },
    { var: 'NEXTAUTH_SECRET', patterns: ['your-secret', 'change-me', 'default'] },
    { var: 'RESEND_API_KEY', patterns: ['your-api-key', 'your-resend-key'] },
    { var: 'OPENAI_API_KEY', patterns: ['your-openai-key', 'sk-your-key'] },
    { var: 'CLAUDE_API_KEY', patterns: ['your-claude-key'] },
    { var: 'SMTP_PASS', patterns: ['your-password', 'your-app-password'] }
  ];

  placeholderPatterns.forEach(({ var: varName, patterns }) => {
    const value = process.env[varName];
    if (value) {
      const hasPlaceholder = patterns.some(pattern => 
        value.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hasPlaceholder) {
        console.log(`🚨 ${varName}: Contains placeholder value - replace with real credentials`);
        securityIssues++;
        allGood = false;
      } else {
        console.log(`✅ ${varName}: No placeholder patterns detected`);
      }
    }
  });

  // Check for common insecure patterns
  const insecurePatterns = [
    { name: 'Weak NextAuth Secret', check: (val) => val && val.length < 32 },
    { name: 'Development MongoDB URI in Production', check: (val) => val && val.includes('localhost') && process.env.NODE_ENV === 'production' },
    { name: 'HTTP URL in Production', check: (val) => val && val.startsWith('http://') && process.env.NODE_ENV === 'production' }
  ];

  if (process.env.NEXTAUTH_SECRET) {
    if (insecurePatterns[0].check(process.env.NEXTAUTH_SECRET)) {
      console.log('🚨 NEXTAUTH_SECRET: Too short for production use (minimum 32 characters)');
      securityIssues++;
      allGood = false;
    }
  }

  if (process.env.MONGODB_URI) {
    if (insecurePatterns[1].check(process.env.MONGODB_URI)) {
      console.log('🚨 MONGODB_URI: Using localhost in production environment');
      securityIssues++;
      allGood = false;
    }
  }

  if (process.env.NEXTAUTH_URL) {
    if (insecurePatterns[2].check(process.env.NEXTAUTH_URL)) {
      console.log('🚨 NEXTAUTH_URL: Using HTTP in production (should use HTTPS)');
      securityIssues++;
      allGood = false;
    }
  }

  // Check for potential credential exposure in environment
  const sensitiveVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'RESEND_API_KEY', 'OPENAI_API_KEY', 'CLAUDE_API_KEY', 'SMTP_PASS'];
  let exposureWarnings = 0;

  sensitiveVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Check if value looks like it might be logged or exposed
      if (value.length < 10) {
        console.log(`⚠️  ${varName}: Value seems too short to be a real credential`);
        exposureWarnings++;
      }
    }
  });

  if (securityIssues === 0 && exposureWarnings === 0) {
    console.log('✅ No security issues detected in environment variables');
  } else if (securityIssues > 0) {
    console.log(`🚨 Found ${securityIssues} security issues that need immediate attention`);
  }

  if (exposureWarnings > 0) {
    console.log(`⚠️  Found ${exposureWarnings} potential configuration warnings`);
  }

  // Optional: Run credential scan if available
  console.log('\nCredential Security Scan:');
  console.log('------------------------');
  
  try {
    const { CredentialScanner } = require('./scripts/scan-credentials.js');
    const scanner = new CredentialScanner();
    const fs = require('fs');
    
    console.log('Running quick credential security scan...');
    
    // Run a focused scan on key files
    const keyFiles = [
      'LAUNCH_GUIDE.md',
      'DEPLOYMENT_GUIDE.md', 
      '.env.example',
      'docs/security-best-practices.md'
    ];
    
    let credentialIssues = 0;
    for (const file of keyFiles) {
      try {
        if (fs.existsSync(file)) {
          // Use synchronous version for check-env.js
          const content = fs.readFileSync(file, 'utf8');
          
          // Check each credential pattern
          for (const patternConfig of scanner.credentialPatterns) {
            const matches = content.match(patternConfig.pattern);
            
            if (matches) {
              for (const match of matches) {
                // Check if this is a safe pattern
                if (!scanner.isSafePattern(match)) {
                  if (patternConfig.severity === 'critical') {
                    credentialIssues++;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        // Skip files that can't be scanned
      }
    }
    
    if (credentialIssues === 0) {
      console.log('✅ No critical credential exposures found in key files');
    } else {
      console.log(`🚨 Found ${credentialIssues} critical credential exposures`);
      console.log('Run "node scripts/scan-credentials.js" for detailed security scan');
      allGood = false;
    }
    
  } catch (error) {
    console.log('⚠️  Credential scanner not available - run "node scripts/scan-credentials.js" manually');
  }

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('🎉 All required environment variables are properly configured!');
    console.log('You can now run "npm run dev" to start the development server.');
  } else {
    console.log('❌ Some environment variables need attention.');
    console.log('Please update your .env.local file with the correct values.');
    console.log('See LAUNCH_GUIDE.md for detailed instructions.');
  }
}

console.log('\n📖 For help setting up these variables, check LAUNCH_GUIDE.md');