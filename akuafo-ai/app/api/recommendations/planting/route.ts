import { NextRequest, NextResponse } from 'next/server';
import { getPlantingAdvisory } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const crop = searchParams.get('crop');

    if (!region || !crop) {
      return NextResponse.json(
        { error: 'Missing required query parameters "region" and "crop"' },
        { status: 400 }
      );
    }

    const advisory = getPlantingAdvisory(region, crop);

    return NextResponse.json({
      region,
      crop,
      advisory
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
