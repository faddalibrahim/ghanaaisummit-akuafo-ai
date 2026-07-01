import { NextRequest, NextResponse } from 'next/server';
import { getHarvestAdvisory } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const crop = searchParams.get('crop');
    const planted = searchParams.get('planted'); // string: YYYY-MM-DD

    if (!region || !crop || !planted) {
      return NextResponse.json(
        { error: 'Missing required query parameters "region", "crop", and "planted"' },
        { status: 400 }
      );
    }

    const advisory = getHarvestAdvisory(region, crop, planted);

    return NextResponse.json({
      region,
      crop,
      planted,
      advisory
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
