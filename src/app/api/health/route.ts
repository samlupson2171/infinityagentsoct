import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { StartupValidator } from '@/lib/startup-validator';

export async function GET() {
  try {
    // Perform environment validation
    const validationResult = StartupValidator.validateEnvironmentGraceful();
    const featureStatus = StartupValidator.getFeatureStatus();
    
    let databaseStatus = 'disconnected';
    let databaseError = null;
    
    // Check database connection if configuration is valid
    if (featureStatus.database) {
      try {
        await connectToDatabase();
        databaseStatus = 'connected';
      } catch (dbError) {
        databaseStatus = 'error';
        databaseError = dbError instanceof Error ? dbError.message : 'Unknown database error';
      }
    } else {
      databaseStatus = 'not_configured';
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (validationResult.isValid && databaseStatus === 'connected') {
      overallStatus = 'healthy';
    } else if (databaseStatus === 'error' || validationResult.errors.length > 0) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: databaseStatus,
        error: databaseError
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        validation: {
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          summary: validationResult.report.summary
        },
        features: featureStatus
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    // Return appropriate status code
    let statusCode = 200;
    if (overallStatus === 'unhealthy') {
      statusCode = 500;
    } else if (overallStatus === 'degraded') {
      statusCode = 206; // Partial Content (degraded)
    }
    
    return NextResponse.json(healthData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: {
          status: 'error',
          error: 'Health check failed'
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          validation: {
            isValid: false,
            errors: ['Environment validation failed to run'],
            warnings: [],
            summary: { totalChecked: 0, passed: 0, failed: 1, warnings: 0 }
          },
          features: {
            database: false,
            email: false,
            aiContent: false
          }
        }
      },
      { status: 500 }
    );
  }
}
