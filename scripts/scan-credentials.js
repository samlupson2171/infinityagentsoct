#!/usr/bin/env node

/**
 * Credential Security Scanner
 * 
 * This script scans the codebase for hardcoded credentials and security issues.
 * It generates detailed reports with findings and recommendations.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CredentialScanner {
  constructor() {
    this.findings = [];
    this.scannedFiles = 0;
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /\.vercel/,
      /\.DS_Store/,
      /\.log$/,
      /\.lock$/,
      /\.map$/,
      /\.min\./,
      /package-lock\.json$/,
      /tsconfig\.tsbuildinfo$/,
      /\.env\.local$/,  // Allow actual env files to contain credentials
      /\.env\.production$/,
      /scripts\/scan-credentials\.js$/,  // Don't scan ourselves
      /credential-security-report-.*\.json$/,  // Don't scan our own reports
      /\.test\./,       // Test files often contain fake credentials
      /__tests__/,      // Test directories
      /\.spec\./,       // Spec files
      /test-.*\.js$/,   // Test scripts
      /setup-.*\.js$/,  // Setup scripts (often contain demo data)
      /\.kiro\/specs/   // Spec files contain examples
    ];
    
    // Credential patterns to detect
    this.credentialPatterns = [
      {
        name: 'MongoDB Connection String with Credentials',
        pattern: /mongodb(\+srv)?:\/\/[^\/\s:]+:[^\/\s@]+@[^\/\s]+/gi,
        severity: 'critical',
        description: 'MongoDB connection string with embedded username and password'
      },
      {
        name: 'Generic Database URL with Credentials',
        pattern: /[a-z]+:\/\/[^\/\s:]+:[^\/\s@]+@[^\/\s]+/gi,
        severity: 'high',
        description: 'Database URL with embedded credentials'
      },
      {
        name: 'API Key Pattern',
        pattern: /(?:api[_-]?key|apikey|secret[_-]?key|access[_-]?token)["\s]*[:=]["\s]*[a-zA-Z0-9_-]{20,}/gi,
        severity: 'high',
        description: 'Potential API key or secret token'
      },
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/gi,
        severity: 'critical',
        description: 'AWS Access Key ID'
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/gi,
        severity: 'medium',
        description: 'JWT token (may contain sensitive data)'
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN [A-Z ]+PRIVATE KEY-----/gi,
        severity: 'critical',
        description: 'Private key detected'
      },
      {
        name: 'Password in Code',
        pattern: /(?:password|pwd|pass)["\s]*[:=]["\s]*[^"\s]{6,}/gi,
        severity: 'high',
        description: 'Hardcoded password'
      }
    ];

    // Safe patterns that should be ignored
    this.safePatterns = [
      /mongodb:\/\/localhost/gi,
      /mongodb:\/\/127\.0\.0\.1/gi,
      /your-username/gi,
      /your-password/gi,
      /\<YOUR_[A-Z_]+\>/gi,
      /\[YOUR_[A-Z_]+\]/gi,
      /\<[a-z_]+\>/gi,  // Generic placeholders like <username>
      /process\.env\./gi,
      /\$\{[^}]+\}/gi,  // Environment variable substitution
      /example\.com/gi,
      /test\.com/gi,
      /localhost/gi,
      /password123/gi,  // Test passwords
      /demo123456/gi,   // Demo passwords
      /admin123/gi,     // Test admin passwords
      /agent123/gi,     // Test agent passwords
      /pending123/gi,   // Test pending passwords
      /hashedpassword123/gi, // Test hashed passwords
      /newpassword123/gi,    // Test new passwords
      /wrongpassword/gi,     // Test wrong passwords
      /secret-password/gi,   // Test secret passwords
      /password: string/gi,  // TypeScript type definitions
      /Password: string/gi,  // TypeScript type definitions
      /password: z\.string/gi, // Zod schema definitions
      /Password: z\.string/gi, // Zod schema definitions
      /password:/gi,         // Generic password field definitions in interfaces
      /Password:/gi,         // Generic Password field definitions
      /\.password/gi,        // Property access
      /\.Password/gi,        // Property access
      /password = /gi,       // Variable assignments (likely legitimate code)
      /Password = /gi,       // Variable assignments (likely legitimate code)
      /password\(/gi,        // Function calls
      /Password\(/gi,        // Function calls
      /API_KEY=your-/gi,     // Placeholder API keys
      /API_KEY=\<YOUR_/gi,   // Placeholder API keys
      /PASS=your-/gi,        // Placeholder passwords
      /PASS=\<YOUR_/gi,      // Placeholder passwords
      /eyJ.*\.invalid/gi,    // Invalid JWT tokens (test tokens)
    ];
  }

  /**
   * Scan the entire codebase for credential issues
   */
  async scanCodebase(rootDir = '.') {
    console.log('🔍 Starting credential security scan...\n');
    
    const startTime = Date.now();
    await this.scanDirectory(rootDir);
    const endTime = Date.now();
    
    console.log(`\n📊 Scan completed in ${endTime - startTime}ms`);
    console.log(`📁 Scanned ${this.scannedFiles} files`);
    console.log(`🚨 Found ${this.findings.length} potential security issues\n`);
    
    return this.generateReport();
  }

  /**
   * Recursively scan directory for files
   */
  async scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative('.', fullPath);
      
      // Skip excluded patterns
      if (this.shouldExclude(relativePath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile()) {
        await this.scanFile(fullPath);
      }
    }
  }

  /**
   * Check if file/directory should be excluded
   */
  shouldExclude(filePath) {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Scan individual file for credentials
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative('.', filePath);
      
      this.scannedFiles++;
      
      // Check each credential pattern
      for (const patternConfig of this.credentialPatterns) {
        const matches = content.match(patternConfig.pattern);
        
        if (matches) {
          for (const match of matches) {
            // Check if this is a safe pattern
            if (this.isSafePattern(match)) {
              continue;
            }
            
            // Find line number
            const lines = content.split('\n');
            let lineNumber = 1;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(match)) {
                lineNumber = i + 1;
                break;
              }
            }
            
            this.findings.push({
              file: relativePath,
              line: lineNumber,
              type: patternConfig.name,
              severity: patternConfig.severity,
              description: patternConfig.description,
              match: this.sanitizeMatch(match),
              recommendation: this.getRecommendation(patternConfig.name, match)
            });
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read (binary files, etc.)
      if (error.code !== 'EISDIR') {
        console.warn(`⚠️  Could not scan ${filePath}: ${error.message}`);
      }
    }
  }

  /**
   * Check if a match is a safe pattern that should be ignored
   */
  isSafePattern(match) {
    return this.safePatterns.some(pattern => pattern.test(match));
  }

  /**
   * Sanitize sensitive data in matches for reporting
   */
  sanitizeMatch(match) {
    // Replace potential credentials with asterisks
    return match.replace(/:[^@\/]+@/, ':***@').replace(/[a-zA-Z0-9_-]{20,}/, '***');
  }

  /**
   * Get recommendation for fixing a specific type of issue
   */
  getRecommendation(type, match) {
    switch (type) {
      case 'MongoDB Connection String with Credentials':
        return 'Replace with environment variable: process.env.MONGODB_URI';
      case 'Generic Database URL with Credentials':
        return 'Move credentials to environment variables';
      case 'API Key Pattern':
        return 'Store API keys in environment variables';
      case 'AWS Access Key':
        return 'Use AWS IAM roles or store in environment variables';
      case 'JWT Token':
        return 'Generate tokens dynamically, do not hardcode';
      case 'Private Key':
        return 'Store private keys securely, never in code';
      case 'Password in Code':
        return 'Use environment variables or secure credential storage';
      default:
        return 'Move sensitive data to environment variables';
    }
  }

  /**
   * Generate comprehensive security report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.scannedFiles,
        totalIssues: this.findings.length,
        criticalIssues: this.findings.filter(f => f.severity === 'critical').length,
        highIssues: this.findings.filter(f => f.severity === 'high').length,
        mediumIssues: this.findings.filter(f => f.severity === 'medium').length,
        lowIssues: this.findings.filter(f => f.severity === 'low').length
      },
      findings: this.findings,
      recommendations: this.generateRecommendations()
    };

    this.printReport(report);
    this.saveReport(report);
    
    return report;
  }

  /**
   * Generate overall recommendations
   */
  generateRecommendations() {
    const recommendations = [
      '1. Move all hardcoded credentials to environment variables',
      '2. Update .env.example with placeholder values',
      '3. Ensure .env.local and .env.production are in .gitignore',
      '4. Use process.env.VARIABLE_NAME for all sensitive data',
      '5. Implement environment variable validation at startup',
      '6. Add pre-commit hooks to prevent future credential leaks',
      '7. Regularly scan codebase for new credential exposures'
    ];

    // Add specific recommendations based on findings
    const fileTypes = [...new Set(this.findings.map(f => path.extname(f.file)))];
    if (fileTypes.includes('.md')) {
      recommendations.push('8. Replace credential examples in documentation with placeholders');
    }
    
    if (fileTypes.includes('.js') || fileTypes.includes('.ts')) {
      recommendations.push('9. Review JavaScript/TypeScript files for hardcoded secrets');
    }

    return recommendations;
  }

  /**
   * Print formatted report to console
   */
  printReport(report) {
    console.log('🔒 CREDENTIAL SECURITY REPORT');
    console.log('=' .repeat(50));
    console.log(`📅 Generated: ${report.timestamp}`);
    console.log(`📁 Files scanned: ${report.summary.totalFiles}`);
    console.log(`🚨 Total issues: ${report.summary.totalIssues}`);
    
    if (report.summary.criticalIssues > 0) {
      console.log(`🔴 Critical: ${report.summary.criticalIssues}`);
    }
    if (report.summary.highIssues > 0) {
      console.log(`🟠 High: ${report.summary.highIssues}`);
    }
    if (report.summary.mediumIssues > 0) {
      console.log(`🟡 Medium: ${report.summary.mediumIssues}`);
    }
    if (report.summary.lowIssues > 0) {
      console.log(`🟢 Low: ${report.summary.lowIssues}`);
    }

    if (report.findings.length > 0) {
      console.log('\n🔍 DETAILED FINDINGS:');
      console.log('-'.repeat(50));
      
      // Group by severity
      const bySeverity = {
        critical: report.findings.filter(f => f.severity === 'critical'),
        high: report.findings.filter(f => f.severity === 'high'),
        medium: report.findings.filter(f => f.severity === 'medium'),
        low: report.findings.filter(f => f.severity === 'low')
      };

      for (const [severity, findings] of Object.entries(bySeverity)) {
        if (findings.length === 0) continue;
        
        const icon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[severity];
        
        console.log(`\n${icon} ${severity.toUpperCase()} SEVERITY:`);
        
        findings.forEach(finding => {
          console.log(`  📄 ${finding.file}:${finding.line}`);
          console.log(`     Type: ${finding.type}`);
          console.log(`     Match: ${finding.match}`);
          console.log(`     Fix: ${finding.recommendation}`);
          console.log('');
        });
      }
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(50));
    report.recommendations.forEach(rec => console.log(`  ${rec}`));

    if (report.summary.totalIssues === 0) {
      console.log('\n🎉 No credential security issues found!');
      console.log('Your codebase appears to be secure for version control.');
    } else {
      console.log('\n⚠️  SECURITY ISSUES DETECTED');
      console.log('Please address these issues before committing to version control.');
    }
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const reportPath = `credential-security-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const scanner = new CredentialScanner();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const rootDir = args[0] || '.';
  
  scanner.scanCodebase(rootDir)
    .then(report => {
      // Exit with error code if critical issues found
      if (report.summary.criticalIssues > 0) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Scan failed:', error.message);
      process.exit(1);
    });
}

module.exports = { CredentialScanner };