import { NextRequest, NextResponse } from 'next/server';
import { recommendCrops } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const monthStr = searchParams.get('month');

    if (!region) {
      return NextResponse.json(
        { error: 'Missing required query parameter "region"' },
        { status: 400 }
      );
    }

    let month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    if (isNaN(month) || month < 1 || month > 12) {
      month = new Date().getMonth() + 1;
    }

    const recommendations = recommendCrops(region, month);

    return NextResponse.json({
      region,
      month,
      recommendations
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
