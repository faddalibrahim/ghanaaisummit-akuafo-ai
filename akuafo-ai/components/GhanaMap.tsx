'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { GHANA_REGIONS, RegionPath } from './ghana-regions';

interface GhanaMapProps {
  selectedRegionId: string;
  onSelectRegion: (id: string) => void;
}

// Map the 16 administrative regions to the 4 agricultural zones modeled in the DB
const REGION_TO_ZONE: { [key: string]: string } = {
  // Northern Sector
  'GHNP': 'northern', // Northern
  'GHNE': 'northern', // North East
  'GHSV': 'northern', // Savannah
  'GHUW': 'northern', // Upper West
  'GHUE': 'northern', // Upper East
  
  // Forest Sector (Ashanti/Bono)
  'GHAH': 'ashanti', // Ashanti
  'GHAF': 'ashanti', // Ahafo
  'GHBO': 'ashanti', // Bono
  'GHBE': 'ashanti', // Bono East
  
  // Eastern/Volta Sector
  'GHTV': 'volta', // Volta
  'GHOT': 'volta', // Oti
  'GHEP': 'volta', // Eastern
  
  // Coastal Sector
  'GHAA': 'greater-accra', // Greater Accra
  'GHCP': 'greater-accra', // Central
  'GHWP': 'greater-accra', // Western
  'GHWN': 'greater-accra', // Western North
};

const ZONE_NAMES: { [key: string]: string } = {
  'northern': 'Northern Sector',
  'ashanti': 'Forest Sector (Ashanti)',
  'volta': 'Eastern/Volta Sector',
  'greater-accra': 'Coastal Sector',
};

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

export default function GhanaMap({ selectedRegionId, onSelectRegion }: GhanaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionPath | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Maintain local state for the active 16-region selection
  const [activeRegionId, setActiveRegionId] = useState<string>(() => {
    if (selectedRegionId === 'northern') return 'GHNP';
    if (selectedRegionId === 'ashanti') return 'GHAH';
    if (selectedRegionId === 'volta') return 'GHTV';
    if (selectedRegionId === 'greater-accra') return 'GHAA';
    return 'GHNP';
  });

  // Sync local active region when parent selectedRegionId changes from outside
  useEffect(() => {
    const currentZone = REGION_TO_ZONE[activeRegionId];
    if (currentZone !== selectedRegionId && selectedRegionId !== activeRegionId) {
      if (selectedRegionId === 'northern') setActiveRegionId('GHNP');
      else if (selectedRegionId === 'ashanti') setActiveRegionId('GHAH');
      else if (selectedRegionId === 'volta') setActiveRegionId('GHTV');
      else if (selectedRegionId === 'greater-accra') setActiveRegionId('GHAA');
      else if (REGION_TO_ZONE[selectedRegionId]) {
        setActiveRegionId(selectedRegionId);
      }
    }
  }, [selectedRegionId]);

  // Find the selected region object to position the pulsing marker
  const activeRegion = useMemo(() => {
    return GHANA_REGIONS.find((r) => r.id === activeRegionId) || GHANA_REGIONS[0];
  }, [activeRegionId]);

  // Compute rendering styles for a path based on hover & selection states
  const getPathStyles = (regionId: string) => {
    const isSelected = activeRegionId === regionId; // Highlight ONLY the selected region
    const isHoveredRegion = hoveredRegion?.id === regionId;

    if (isSelected) {
      if (isHoveredRegion) {
        return {
          fill: '#1b4332', // Darker forest green on direct hover
          stroke: '#ffffff',
          strokeWidth: 2,
          opacity: 1,
        };
      }
      return {
        fill: '#2d6a4f', // Rich Forest Green for selected region
        stroke: '#ffffff',
        strokeWidth: 1.8,
        opacity: 1,
      };
    }

    if (isHoveredRegion) {
      return {
        fill: 'rgba(45, 106, 79, 0.45)', // Individual hover highlight
        stroke: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
      };
    }

    // Default inactive state: translucent forest green glass look
    return {
      fill: 'rgba(45, 106, 79, 0.08)',
      stroke: 'rgba(45, 106, 79, 0.25)',
      strokeWidth: 1.2,
      opacity: 0.9,
    };
  };

  const handleMouseMove = (e: React.MouseEvent, region: RegionPath) => {
    const container = e.currentTarget.closest('.map-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: region.name,
      });
    }
  };

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    onSelectRegion(regionId); // Pass 16-region ID to the parent directly
  };

  return (
    <div className="map-container w-full flex flex-col items-center select-none bg-white/30 dark:bg-black/10 p-4 rounded-2xl border border-agri-green-100/50 dark:border-agri-green-700/10 relative overflow-hidden">
      
      {/* SVG Container with Cropped Bounding Box (viewBox focusing on coordinates 160-800 X, 50-950 Y) */}
      <div className="relative w-full max-w-[270px] flex justify-center py-2">
        <svg
          viewBox="160 50 640 900"
          width="100%"
          height="100%"
          className="transition-all duration-300 drop-shadow-sm"
        >
          {/* Ghana Region Outlines */}
          <g>
            {GHANA_REGIONS.map((region) => {
              const styles = getPathStyles(region.id);
              return (
                <path
                  key={region.id}
                  d={region.d}
                  fill={styles.fill}
                  stroke={styles.stroke}
                  strokeWidth={styles.strokeWidth}
                  opacity={styles.opacity}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseMove={(e) => handleMouseMove(e, region)}
                  onMouseLeave={() => {
                    setHoveredRegion(null);
                    setTooltip(null);
                  }}
                  onClick={() => handleSelectRegion(region.id)}
                />
              );
            })}
          </g>

          {/* Single Pulsing Marker at the selected region's center */}
          {activeRegion && (
            <g className="pointer-events-none">
              {/* Pulsing outer aura */}
              <circle
                cx={activeRegion.cx}
                cy={activeRegion.cy}
                r={16}
                fill="#2d6a4f"
                className="opacity-40 animate-pulse"
              />
              {/* Outer circle */}
              <circle
                cx={activeRegion.cx}
                cy={activeRegion.cy}
                r={9}
                fill="#2d6a4f"
                stroke="#ffffff"
                strokeWidth={2}
              />
              {/* Center pin-point */}
              <circle
                cx={activeRegion.cx}
                cy={activeRegion.cy}
                r={3.5}
                fill="#ffffff"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Floating Tooltip Bubble - matching original styling parameters: #1b4332 bg, text white, rounded 8px, padding 6px 12px */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none px-3 py-1.5 rounded-[8px] text-white text-[11px] font-bold shadow-md transition-all duration-75 select-none"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y - 12}px`,
            transform: 'translate(-50%, -100%)', // Center horizontally and offset vertically above cursor
            backgroundColor: '#1b4332',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Map Legend */}
      <div className="flex gap-4 mt-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-agri-green-600 dark:bg-agri-green-500" />
          <span>Selected Region</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-agri-green-100 dark:bg-agri-green-900/40 border border-agri-green-200/50" />
          <span>Other Regions</span>
        </div>
      </div>
    </div>
  );
}
