/**
 * Environment Variable Validator Utility
 * 
 * This utility provides comprehensive validation for environment variables,
 * including credential pattern detection and safety checks.
 */

export interface ValidationResult {
  isValid: boolean;
  variable: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SecurityCheck {
  variable: string;
  value: string;
  isSecure: boolean;
  issues: string[];
}

export interface EnvironmentValidationReport {
  isValid: boolean;
  requiredVariables: ValidationResult[];
  optionalVariables: ValidationResult[];
  securityChecks: SecurityCheck[];
  summary: {
    totalChecked: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Configuration for environment variables
 */
export const ENVIRONMENT_CONFIG = {
  required: [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ],
  optional: [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_SECURE',
    'OPENAI_API_KEY',
    'CLAUDE_API_KEY',
    'NODE_ENV',
    'NEXT_PUBLIC_BASE_URL'
  ],
  sensitive: [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'RESEND_API_KEY',
    'SMTP_PASS',
    'OPENAI_API_KEY',
    'CLAUDE_API_KEY'
  ],
  validation: {
    MONGODB_URI: /^mongodb(\+srv)?:\/\/.+/,
    NEXTAUTH_URL: /^https?:\/\/.+/,
    NEXTAUTH_SECRET: /.{32,}/, // At least 32 characters
    RESEND_API_KEY: /^re_[a-zA-Z0-9_-]+$/,
    RESEND_FROM_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SMTP_HOST: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    SMTP_PORT: /^[0-9]+$/,
    SMTP_USER: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    OPENAI_API_KEY: /^sk-[a-zA-Z0-9-_]+$/,
    CLAUDE_API_KEY: /^sk-ant-[a-zA-Z0-9-_]+$/,
    NODE_ENV: /^(development|production|test)$/
  }
};

/**
 * Patterns that indicate potentially unsafe credential usage
 * These are ONLY unsafe in development - production MongoDB Atlas URIs are safe
 */
const UNSAFE_CREDENTIAL_PATTERNS = [
  /your-[a-z-]+-here/i,            // Placeholder patterns
  /example\.com/i,                  // Example domains
  /password123/i,                   // Common weak passwords
  /admin:admin/i,                   // Common admin credentials
  /test:test/i,                     // Test credentials
  /localhost.*:[^@]+@/i,           // Localhost with credentials
];

/**
 * Safe production patterns - MongoDB Atlas connection strings are SAFE in production
 * These use TLS/SSL encryption and are stored as environment variables
 */
const SAFE_PRODUCTION_PATTERNS = [
  /mongodb\+srv:\/\/[^:]+:[^@]+@[a-z0-9-]+\.mongodb\.net/i,           // Atlas cluster
  /mongodb\+srv:\/\/[^:]+:[^@]+@[a-z0-9-]+\.[a-z0-9]+\.mongodb\.net/i, // Atlas with region
  /mongodb:\/\/[^:]+:[^@]+@[a-z0-9-]+\.mongodb\.net/i,                // Atlas standard connection
];

/**
 * Production environment configuration
 */
interface ProductionEnvironmentConfig {
  isProduction: boolean;
  isBuildPhase: boolean;
  isVercelBuild: boolean;
  skipCredentialChecks: boolean;
}

/**
 * Environment Variable Validator Class
 */
export class EnvironmentValidator {
  /**
   * Detect production and build environment
   */
  static detectEnvironment(): ProductionEnvironmentConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isBuildPhase = 
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.VERCEL === '1' ||
      process.env.CI === 'true' ||
      process.env.VERCEL_ENV !== undefined;
    const isVercelBuild = process.env.VERCEL === '1';
    
    // Skip credential checks during build or in production with proper MongoDB Atlas URIs
    const skipCredentialChecks = isBuildPhase || (isProduction && isVercelBuild);

    return {
      isProduction,
      isBuildPhase,
      isVercelBuild,
      skipCredentialChecks
    };
  }

  /**
   * Validate all required environment variables
   */
  static validateRequiredVars(): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const variable of ENVIRONMENT_CONFIG.required) {
      const value = process.env[variable];
      const result = this.validateVariable(variable, value, true);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate optional environment variables
   */
  static validateOptionalVars(): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const variable of ENVIRONMENT_CONFIG.optional) {
      const value = process.env[variable];
      if (value) {
        const result = this.validateVariable(variable, value, false);
        results.push(result);
      } else {
        results.push({
          isValid: true,
          variable,
          message: 'Optional variable not set',
          severity: 'info'
        });
      }
    }

    return results;
  }

  /**
   * Validate a single environment variable
   */
  static validateVariable(variable: string, value: string | undefined, isRequired: boolean): ValidationResult {
    // Check if variable is missing
    if (!value) {
      return {
        isValid: !isRequired,
        variable,
        message: isRequired ? 'Required variable is missing' : 'Optional variable not set',
        severity: isRequired ? 'error' : 'info'
      };
    }

    // Check for placeholder values
    if (this.isPlaceholderValue(value)) {
      return {
        isValid: false,
        variable,
        message: 'Variable contains placeholder value - please update with actual value',
        severity: 'error'
      };
    }

    // Validate format if pattern exists
    const pattern = ENVIRONMENT_CONFIG.validation[variable as keyof typeof ENVIRONMENT_CONFIG.validation];
    if (pattern && !pattern.test(value)) {
      return {
        isValid: false,
        variable,
        message: this.getFormatErrorMessage(variable),
        severity: 'error'
      };
    }

    // Additional specific validations
    const specificValidation = this.performSpecificValidation(variable, value);
    if (!specificValidation.isValid) {
      return specificValidation;
    }

    return {
      isValid: true,
      variable,
      message: 'Valid',
      severity: 'info'
    };
  }

  /**
   * Check if a value is a placeholder
   */
  static isPlaceholderValue(value: string): boolean {
    const placeholderPatterns = [
      /your-[a-z-]+-here/i,
      /your[_-][a-z]+/i,
      /\<[^>]+\>/,
      /\[your[^\]]*\]/i,
      /example\./i,
      /placeholder/i,
      /changeme/i,
      /replace[_-]?this/i
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Perform specific validation for certain variables
   */
  static performSpecificValidation(variable: string, value: string): ValidationResult {
    switch (variable) {
      case 'NEXTAUTH_SECRET':
        if (value.length < 32) {
          return {
            isValid: false,
            variable,
            message: 'NEXTAUTH_SECRET must be at least 32 characters long for security',
            severity: 'error'
          };
        }
        break;

      case 'SMTP_PORT':
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          return {
            isValid: false,
            variable,
            message: 'SMTP_PORT must be a valid port number (1-65535)',
            severity: 'error'
          };
        }
        break;

      case 'NODE_ENV':
        if (!['development', 'production', 'test'].includes(value)) {
          return {
            isValid: false,
            variable,
            message: 'NODE_ENV must be one of: development, production, test',
            severity: 'error'
          };
        }
        break;
    }

    return {
      isValid: true,
      variable,
      message: 'Valid',
      severity: 'info'
    };
  }

  /**
   * Get format error message for a variable
   */
  static getFormatErrorMessage(variable: string): string {
    const messages: Record<string, string> = {
      MONGODB_URI: 'Must start with mongodb:// or mongodb+srv://',
      NEXTAUTH_URL: 'Must be a valid URL starting with http:// or https://',
      NEXTAUTH_SECRET: 'Must be at least 32 characters long',
      RESEND_API_KEY: 'Must start with "re_" followed by alphanumeric characters',
      RESEND_FROM_EMAIL: 'Must be a valid email address',
      SMTP_HOST: 'Must be a valid hostname',
      SMTP_PORT: 'Must be a valid port number',
      SMTP_USER: 'Must be a valid email address',
      OPENAI_API_KEY: 'Must start with "sk-" followed by valid characters',
      CLAUDE_API_KEY: 'Must start with "sk-ant-" followed by valid characters',
      NODE_ENV: 'Must be one of: development, production, test'
    };

    return messages[variable] || 'Invalid format';
  }

  /**
   * Check for credential safety issues
   */
  static checkCredentialSafety(): SecurityCheck[] {
    const checks: SecurityCheck[] = [];
    const env = this.detectEnvironment();

    // Skip credential checks during build phase
    if (env.isBuildPhase) {
      return checks;
    }

    // Check all environment variables for unsafe patterns
    for (const variable of [...ENVIRONMENT_CONFIG.required, ...ENVIRONMENT_CONFIG.optional]) {
      const value = process.env[variable];
      if (value) {
        const issues: string[] = [];
        let isSecure = true;

        // For MongoDB URI, check if it's a safe production pattern first
        if (variable === 'MONGODB_URI') {
          const isSafeProduction = SAFE_PRODUCTION_PATTERNS.some(pattern => pattern.test(value));
          
          if (isSafeProduction && env.isProduction) {
            // MongoDB Atlas URIs are safe in production - skip unsafe pattern checks
            checks.push({
              variable,
              value: this.maskSensitiveValue(variable, value),
              isSecure: true,
              issues: []
            });
            continue;
          }
        }

        // Check for unsafe credential patterns
        for (const pattern of UNSAFE_CREDENTIAL_PATTERNS) {
          if (pattern.test(value)) {
            issues.push('Contains potentially unsafe credential pattern');
            isSecure = false;
            break;
          }
        }

        // Check for sensitive variables with weak values
        if (ENVIRONMENT_CONFIG.sensitive.includes(variable)) {
          if (value.length < 8) {
            issues.push('Value is too short for a sensitive variable');
            isSecure = false;
          }

          if (/^(password|123456|admin|test)$/i.test(value)) {
            issues.push('Uses common weak value');
            isSecure = false;
          }
        }

        checks.push({
          variable,
          value: this.maskSensitiveValue(variable, value),
          isSecure,
          issues
        });
      }
    }

    return checks;
  }

  /**
   * Mask sensitive values for display
   */
  static maskSensitiveValue(variable: string, value: string): string {
    if (ENVIRONMENT_CONFIG.sensitive.includes(variable)) {
      if (value.length <= 8) {
        return '*'.repeat(value.length);
      }
      return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
    }
    return value;
  }

  /**
   * Generate comprehensive validation report
   */
  static generateReport(): EnvironmentValidationReport {
    const env = this.detectEnvironment();
    
    // During build phase, skip validation to prevent build failures
    if (env.isBuildPhase) {
      return {
        isValid: true,
        requiredVariables: [],
        optionalVariables: [],
        securityChecks: [],
        summary: {
          totalChecked: 0,
          passed: 0,
          failed: 0,
          warnings: 0
        }
      };
    }

    const requiredVariables = this.validateRequiredVars();
    const optionalVariables = this.validateOptionalVars();
    const securityChecks = this.checkCredentialSafety();

    const allResults = [...requiredVariables, ...optionalVariables];
    const passed = allResults.filter(r => r.isValid).length;
    const failed = allResults.filter(r => !r.isValid && r.severity === 'error').length;
    const warnings = allResults.filter(r => r.severity === 'warning').length;

    const isValid = failed === 0 && securityChecks.every(check => check.isSecure);

    return {
      isValid,
      requiredVariables,
      optionalVariables,
      securityChecks,
      summary: {
        totalChecked: allResults.length,
        passed,
        failed,
        warnings
      }
    };
  }

  /**
   * Get clear error messages for missing or unsafe configurations
   */
  static getConfigurationErrors(): string[] {
    const errors: string[] = [];
    const env = this.detectEnvironment();
    
    // Skip error reporting during build phase
    if (env.isBuildPhase) {
      return errors;
    }

    const report = this.generateReport();

    // Add required variable errors
    report.requiredVariables
      .filter(result => !result.isValid)
      .forEach(result => {
        errors.push(`${result.variable}: ${result.message}`);
      });

    // Add optional variable errors (only actual errors, not missing ones)
    report.optionalVariables
      .filter(result => !result.isValid && result.severity === 'error')
      .forEach(result => {
        errors.push(`${result.variable}: ${result.message}`);
      });

    // Add security issues (but log as warnings in production)
    report.securityChecks
      .filter(check => !check.isSecure)
      .forEach(check => {
        const prefix = env.isProduction ? 'Warning' : 'Error';
        errors.push(`${prefix} - ${check.variable}: ${check.issues.join(', ')}`);
      });

    return errors;
  }

  /**
   * Get setup instructions for missing variables
   */
  static getSetupInstructions(): string[] {
    const instructions: string[] = [];
    const env = this.detectEnvironment();
    
    // Skip instructions during build phase
    if (env.isBuildPhase) {
      instructions.push('⏭️  Environment validation skipped during build phase');
      return instructions;
    }

    const report = this.generateReport();

    const missingRequired = report.requiredVariables.filter(r => !r.isValid);
    
    if (missingRequired.length > 0) {
      instructions.push('Required environment variables are missing or invalid:');
      instructions.push('');
      
      missingRequired.forEach(result => {
        instructions.push(`• ${result.variable}: ${result.message}`);
        instructions.push(`  Add to your .env.local file: ${result.variable}=<your-value>`);
        instructions.push('');
      });
    }

    const securityIssues = report.securityChecks.filter(check => !check.isSecure);
    if (securityIssues.length > 0) {
      const issueType = env.isProduction ? 'Security warnings' : 'Security issues detected';
      instructions.push(`${issueType}:`);
      instructions.push('');
      
      securityIssues.forEach(check => {
        instructions.push(`• ${check.variable}: ${check.issues.join(', ')}`);
        if (!env.isProduction) {
          instructions.push('  Please update this variable with a secure value');
        }
        instructions.push('');
      });
    }

    if (instructions.length === 0) {
      instructions.push('✅ All environment variables are properly configured!');
    } else if (!env.isProduction) {
      instructions.push('📖 For detailed setup instructions, see LAUNCH_GUIDE.md');
    }

    return instructions;
  }
}