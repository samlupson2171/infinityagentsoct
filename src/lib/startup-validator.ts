/**
 * Startup Environment Validation
 * 
 * This module provides startup validation for environment variables
 * and graceful error handling for configuration issues.
 */

import { EnvironmentValidator, type EnvironmentValidationReport } from './environment-validator';

export interface StartupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  report: EnvironmentValidationReport;
}

/**
 * Startup Environment Validator Class
 */
export class StartupValidator {
  private static hasValidated = false;
  private static validationResult: StartupValidationResult | null = null;

  /**
   * Perform startup environment validation
   * This should be called early in the application lifecycle
   */
  static validateEnvironment(): StartupValidationResult {
    // Only validate once per application startup
    if (this.hasValidated && this.validationResult) {
      return this.validationResult;
    }

    // Enhanced build environment detection
    // Skip validation during any build scenario to prevent false positives
    const isBuildEnvironment = this.detectBuildEnvironment();
    
    if (isBuildEnvironment) {
      const buildType = this.getBuildEnvironmentType();
      console.log(`🔍 Skipping environment validation (${buildType} detected)`);
      this.validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        report: {
          isValid: true,
          requiredVariables: [],
          optionalVariables: [],
          securityChecks: [],
          summary: { totalChecked: 0, passed: 0, failed: 0, warnings: 0 }
        }
      };
      this.hasValidated = true;
      return this.validationResult;
    }

    console.log('🔍 Validating environment configuration...');
    
    const report = EnvironmentValidator.generateReport();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Collect critical errors (required variables)
    report.requiredVariables
      .filter(result => !result.isValid)
      .forEach(result => {
        errors.push(`${result.variable}: ${result.message}`);
      });

    // Collect optional variable errors (only actual errors, not missing ones)
    report.optionalVariables
      .filter(result => !result.isValid && result.severity === 'error')
      .forEach(result => {
        errors.push(`${result.variable}: ${result.message}`);
      });

    // Collect security issues as errors
    report.securityChecks
      .filter(check => !check.isSecure)
      .forEach(check => {
        errors.push(`${check.variable}: ${check.issues.join(', ')}`);
      });

    // Collect warnings
    report.optionalVariables
      .filter(result => result.severity === 'warning')
      .forEach(result => {
        warnings.push(`${result.variable}: ${result.message}`);
      });

    const isValid = errors.length === 0;

    this.validationResult = {
      isValid,
      errors,
      warnings,
      report
    };

    this.hasValidated = true;

    // Log results
    this.logValidationResults(this.validationResult);

    return this.validationResult;
  }

  /**
   * Detect if running in a build environment
   * Checks multiple indicators to ensure validation is skipped during all build scenarios
   */
  private static detectBuildEnvironment(): boolean {
    // Next.js build phase detection
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    
    // Vercel environment detection
    const isVercelBuild = process.env.VERCEL === '1';
    const hasVercelEnv = process.env.VERCEL_ENV !== undefined;
    
    // CI environment detection
    const isCIBuild = process.env.CI === '1' || process.env.CI === 'true';
    
    // GitHub Actions detection
    const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    
    // GitLab CI detection
    const isGitLabCI = process.env.GITLAB_CI === 'true';
    
    // Additional build indicators
    const isProductionBuild = process.env.NODE_ENV === 'production' && 
                             (isBuildPhase || isVercelBuild || isCIBuild);
    
    return isBuildPhase || 
           isVercelBuild || 
           hasVercelEnv || 
           isCIBuild || 
           isGitHubActions || 
           isGitLabCI || 
           isProductionBuild;
  }

  /**
   * Get a human-readable description of the build environment type
   */
  private static getBuildEnvironmentType(): string {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return 'Next.js build phase';
    }
    if (process.env.VERCEL === '1') {
      return 'Vercel build environment';
    }
    if (process.env.GITHUB_ACTIONS === 'true') {
      return 'GitHub Actions CI';
    }
    if (process.env.GITLAB_CI === 'true') {
      return 'GitLab CI';
    }
    if (process.env.CI === '1' || process.env.CI === 'true') {
      return 'CI environment';
    }
    if (process.env.VERCEL_ENV !== undefined) {
      return 'Vercel environment';
    }
    return 'build environment';
  }

  /**
   * Log validation results to console
   */
  private static logValidationResults(result: StartupValidationResult): void {
    if (result.isValid) {
      console.log('✅ Environment validation passed');
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`   ${warning}`);
        });
      }
      
      console.log(`📊 Summary: ${result.report.summary.passed}/${result.report.summary.totalChecked} variables configured correctly`);
    } else {
      console.error('❌ Environment validation failed');
      console.error('\n🚨 Critical Issues:');
      result.errors.forEach(error => {
        console.error(`   ${error}`);
      });
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`   ${warning}`);
        });
      }
      
      console.error('\n📖 For setup instructions, see LAUNCH_GUIDE.md or run: node check-env.js');
    }
  }

  /**
   * Validate environment and throw error if critical issues found
   * Use this for strict validation that should prevent application startup
   */
  static validateEnvironmentStrict(): void {
    const result = this.validateEnvironment();
    
    if (!result.isValid) {
      const errorMessage = [
        'Environment validation failed. The following issues must be resolved:',
        '',
        ...result.errors.map(error => `• ${error}`),
        '',
        'Please update your .env.local file with the correct values.',
        'For detailed setup instructions, see LAUNCH_GUIDE.md or run: node check-env.js'
      ].join('\n');
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate environment with graceful degradation
   * Use this for non-critical validation that logs warnings but doesn't prevent startup
   */
  static validateEnvironmentGraceful(): StartupValidationResult {
    const result = this.validateEnvironment();
    
    if (!result.isValid) {
      console.warn('\n⚠️  Application starting with configuration issues.');
      console.warn('Some features may not work correctly until these are resolved.');
    }
    
    return result;
  }

  /**
   * Get user-friendly error messages for configuration issues
   */
  static getConfigurationHelp(): string[] {
    const result = this.validateEnvironment();
    
    if (result.isValid) {
      return ['✅ All environment variables are properly configured!'];
    }

    const help: string[] = [
      '🔧 Configuration Help',
      '==================',
      ''
    ];

    if (result.errors.length > 0) {
      help.push('Critical Issues (must be fixed):');
      result.errors.forEach(error => {
        help.push(`• ${error}`);
      });
      help.push('');
    }

    if (result.warnings.length > 0) {
      help.push('Warnings (recommended to fix):');
      result.warnings.forEach(warning => {
        help.push(`• ${warning}`);
      });
      help.push('');
    }

    help.push('Setup Instructions:');
    help.push('1. Copy .env.example to .env.local: cp .env.example .env.local');
    help.push('2. Update all placeholder values in .env.local');
    help.push('3. Run validation: node check-env.js');
    help.push('4. For detailed help, see LAUNCH_GUIDE.md');

    return help;
  }

  /**
   * Check if a specific feature is available based on environment configuration
   */
  static isFeatureAvailable(feature: string): boolean {
    const result = this.validateEnvironment();
    
    switch (feature) {
      case 'email':
        return this.hasValidEmailConfig(result.report);
      case 'ai-content':
        return this.hasValidAIConfig(result.report);
      case 'database':
        return this.hasValidDatabaseConfig(result.report);
      default:
        return true;
    }
  }

  /**
   * Check if email configuration is valid
   */
  private static hasValidEmailConfig(report: EnvironmentValidationReport): boolean {
    const resendValid = report.optionalVariables
      .filter(v => ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'].includes(v.variable))
      .every(v => v.isValid);
    
    const smtpValid = report.optionalVariables
      .filter(v => ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].includes(v.variable))
      .every(v => v.isValid);
    
    return resendValid || smtpValid;
  }

  /**
   * Check if AI configuration is valid
   */
  private static hasValidAIConfig(report: EnvironmentValidationReport): boolean {
    return report.optionalVariables
      .filter(v => ['OPENAI_API_KEY', 'CLAUDE_API_KEY'].includes(v.variable))
      .some(v => v.isValid);
  }

  /**
   * Check if database configuration is valid
   */
  private static hasValidDatabaseConfig(report: EnvironmentValidationReport): boolean {
    return report.requiredVariables
      .filter(v => v.variable === 'MONGODB_URI')
      .every(v => v.isValid);
  }

  /**
   * Get feature availability status
   */
  static getFeatureStatus(): Record<string, boolean> {
    return {
      database: this.isFeatureAvailable('database'),
      email: this.isFeatureAvailable('email'),
      aiContent: this.isFeatureAvailable('ai-content')
    };
  }

  /**
   * Reset validation state (useful for testing)
   */
  static reset(): void {
    this.hasValidated = false;
    this.validationResult = null;
  }
}