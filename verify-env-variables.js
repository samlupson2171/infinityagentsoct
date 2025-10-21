#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set
 * and validates their format. Run this before deploying to Vercel.
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70));
}

function checkVariable(name, options = {}) {
  const {
    required = true,
    minLength = 0,
    pattern = null,
    description = '',
    sensitive = false,
  } = options;

  const value = process.env[name];
  const exists = value !== undefined && value !== '';

  let status = '✓';
  let statusColor = 'green';
  let message = '';

  if (!exists) {
    if (required) {
      status = '✗';
      statusColor = 'red';
      message = 'MISSING (Required)';
    } else {
      status = '○';
      statusColor = 'yellow';
      message = 'Not set (Optional)';
    }
  } else {
    // Check minimum length
    if (minLength > 0 && value.length < minLength) {
      status = '⚠';
      statusColor = 'yellow';
      message = `Too short (min ${minLength} chars, got ${value.length})`;
    }

    // Check pattern
    if (pattern && !pattern.test(value)) {
      status = '⚠';
      statusColor = 'yellow';
      message = 'Invalid format';
    }

    // Check for placeholder values
    const placeholders = [
      'your-',
      'change-in-production',
      'placeholder',
      'example',
      'test-',
      'dummy',
    ];
    if (placeholders.some(p => value.toLowerCase().includes(p))) {
      status = '⚠';
      statusColor = 'yellow';
      message = 'Contains placeholder value';
    }

    if (!message) {
      message = sensitive ? 'Set (hidden)' : `Set: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`;
    }
  }

  const displayValue = sensitive && exists ? '***' : message;
  log(`  ${status} ${name}`, statusColor);
  if (description) {
    log(`    ${description}`, 'blue');
  }
  log(`    ${displayValue}`, statusColor);

  return {
    name,
    exists,
    valid: status === '✓',
    warning: status === '⚠',
    error: status === '✗',
  };
}

async function verifyEnvironmentVariables() {
  logSection('Environment Variables Verification');

  const results = {
    total: 0,
    valid: 0,
    warnings: 0,
    errors: 0,
    variables: [],
  };

  // Database Configuration
  logSection('1. Database Configuration (REQUIRED)');
  
  results.variables.push(
    checkVariable('MONGODB_URI', {
      required: true,
      minLength: 20,
      pattern: /^mongodb(\+srv)?:\/\/.+/,
      description: 'MongoDB connection string',
      sensitive: true,
    })
  );

  // NextAuth Configuration
  logSection('2. NextAuth Configuration (REQUIRED)');
  
  results.variables.push(
    checkVariable('NEXTAUTH_URL', {
      required: true,
      pattern: /^https?:\/\/.+/,
      description: 'Base URL for authentication (must match production domain)',
      sensitive: false,
    })
  );

  results.variables.push(
    checkVariable('NEXTAUTH_SECRET', {
      required: true,
      minLength: 32,
      description: 'Secret key for session encryption (min 32 characters)',
      sensitive: true,
    })
  );

  // Email Configuration
  logSection('3. Email Configuration (REQUIRED - Choose ONE option)');
  
  log('\n  Option A: SMTP Configuration', 'blue');
  const smtpVars = [
    checkVariable('SMTP_HOST', {
      required: false,
      description: 'SMTP server hostname',
    }),
    checkVariable('SMTP_PORT', {
      required: false,
      pattern: /^\d+$/,
      description: 'SMTP server port (usually 587 or 465)',
    }),
    checkVariable('SMTP_USER', {
      required: false,
      description: 'SMTP username/email',
    }),
    checkVariable('SMTP_PASS', {
      required: false,
      description: 'SMTP password',
      sensitive: true,
    }),
    checkVariable('SMTP_SECURE', {
      required: false,
      pattern: /^(true|false)$/,
      description: 'Use TLS (true/false)',
    }),
    checkVariable('EMAIL_FROM_NAME', {
      required: false,
      description: 'Sender name for emails',
    }),
    checkVariable('EMAIL_FROM_ADDRESS', {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'Sender email address',
    }),
  ];

  log('\n  Option B: Resend Configuration', 'blue');
  const resendVars = [
    checkVariable('RESEND_API_KEY', {
      required: false,
      pattern: /^re_/,
      description: 'Resend API key',
      sensitive: true,
    }),
    checkVariable('RESEND_FROM_EMAIL', {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'Sender email address',
    }),
    checkVariable('RESEND_FROM_NAME', {
      required: false,
      description: 'Sender name for emails',
    }),
    checkVariable('RESEND_TO_EMAIL', {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'Default recipient email',
    }),
    checkVariable('RESEND_TO_NAME', {
      required: false,
      description: 'Default recipient name',
    }),
  ];

  results.variables.push(...smtpVars, ...resendVars);

  // Check if at least one email option is configured
  const smtpConfigured = smtpVars.every(v => v.exists);
  const resendConfigured = resendVars.every(v => v.exists);

  if (!smtpConfigured && !resendConfigured) {
    log('\n  ⚠ Warning: No email configuration detected', 'yellow');
    log('    Configure either SMTP or Resend for email functionality', 'yellow');
  } else if (smtpConfigured) {
    log('\n  ✓ SMTP configuration detected', 'green');
  } else if (resendConfigured) {
    log('\n  ✓ Resend configuration detected', 'green');
  }

  // AI Services
  logSection('4. AI Services (OPTIONAL)');
  
  results.variables.push(
    checkVariable('OPENAI_API_KEY', {
      required: false,
      pattern: /^sk-/,
      description: 'OpenAI API key for AI content generation',
      sensitive: true,
    })
  );

  // Application Environment
  logSection('5. Application Environment');
  
  results.variables.push(
    checkVariable('NODE_ENV', {
      required: false,
      pattern: /^(development|production|test)$/,
      description: 'Application environment mode',
    })
  );

  // Calculate results
  results.total = results.variables.length;
  results.valid = results.variables.filter(v => v.valid).length;
  results.warnings = results.variables.filter(v => v.warning).length;
  results.errors = results.variables.filter(v => v.error).length;

  // Summary
  logSection('Verification Summary');

  log(`\nTotal variables checked: ${results.total}`, 'blue');
  log(`✓ Valid: ${results.valid}`, 'green');
  log(`⚠ Warnings: ${results.warnings}`, 'yellow');
  log(`✗ Errors: ${results.errors}`, 'red');

  // Critical issues
  const criticalIssues = results.variables.filter(v => v.error);
  if (criticalIssues.length > 0) {
    log('\n❌ CRITICAL ISSUES FOUND:', 'red');
    criticalIssues.forEach(v => {
      log(`  - ${v.name} is missing or invalid`, 'red');
    });
    log('\nYour application will NOT work without these variables!', 'red');
  }

  // Warnings
  const warnings = results.variables.filter(v => v.warning);
  if (warnings.length > 0) {
    log('\n⚠ WARNINGS:', 'yellow');
    warnings.forEach(v => {
      log(`  - ${v.name} has issues`, 'yellow');
    });
    log('\nThese should be fixed before deploying to production.', 'yellow');
  }

  // Success
  if (criticalIssues.length === 0 && warnings.length === 0) {
    log('\n✓ All environment variables are properly configured!', 'green');
    log('Your application is ready for deployment.', 'green');
  }

  // Recommendations
  logSection('Recommendations');

  log('\nBefore deploying to Vercel:', 'blue');
  log('  1. Set all required variables in Vercel dashboard', 'blue');
  log('  2. Use strong, unique values for secrets', 'blue');
  log('  3. Update NEXTAUTH_URL to match production domain', 'blue');
  log('  4. Ensure MongoDB Atlas allows Vercel connections (0.0.0.0/0)', 'blue');
  log('  5. Trigger redeployment after adding variables', 'blue');

  log('\nFor detailed instructions, see:', 'blue');
  log('  .kiro/specs/enquiry-form-vercel-deployment/VERCEL_ENVIRONMENT_VARIABLES_GUIDE.md', 'cyan');

  // Exit code
  process.exit(criticalIssues.length > 0 ? 1 : 0);
}

// Run verification
verifyEnvironmentVariables().catch(error => {
  log(`\nUnexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
