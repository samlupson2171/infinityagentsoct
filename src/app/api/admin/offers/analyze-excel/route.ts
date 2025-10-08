import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { excelSmartDetector } from '@/lib/excel-smart-detector';
import { excelMetadataExtractor } from '@/lib/excel-metadata-extractor';


export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: { message: 'Forbidden - Admin access required' } },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided' } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: {
            message:
              'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: { message: 'File too large. Maximum size is 10MB' } },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Analyze the Excel file
    const detector = new excelSmartDetector(buffer);
    const analysis = detector.analyzeExcelFile();
    
    // Create workbook for metadata extraction
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const extractor = new excelMetadataExtractor(workbook);
    const metadata = extractor.extractMetadata();

    // Combine analysis results
    const result = {
      analysis: analysis,
      metadata: {
        ...metadata,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      },
      layoutDetection: analysis.layoutDetection,
      pricingSection: analysis.pricingSection,
      inclusionsSection: analysis.inclusionsSection,
      confidence: analysis.confidence,
      recommendations: analysis.recommendations || [],
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Excel analysis error:', error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to analyze Excel file',
        },
      },
      { status: 500 }
    );
  }
}
