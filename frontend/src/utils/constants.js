import React from 'react';
import { AlertCircle } from 'lucide-react';
import waterLogo from '../assets/categories/water.png';
import electricityLogo from '../assets/categories/electricity.png';
import roadsLogo from '../assets/categories/roads.png';
import sanitationLogo from '../assets/categories/sanitation.png';
import streetlightLogo from '../assets/categories/streetlight.png';
import drainageLogo from '../assets/categories/drainage.png';

const createCategoryIcon = (src, alt) => {
  const IconComponent = ({ size = 26, style, className, color, ...rest }) => (
    React.createElement('img', {
      src,
      alt,
      width: size,
      height: size,
      style: {
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      },
      className,
      ...rest,
    })
  );
  IconComponent.displayName = `${alt}Icon`;
  return IconComponent;
};

export const WaterIcon = createCategoryIcon(waterLogo, 'Water Supply');
export const ElectricityIcon = createCategoryIcon(electricityLogo, 'Electricity');
export const RoadsIcon = createCategoryIcon(roadsLogo, 'Roads');
export const SanitationIcon = createCategoryIcon(sanitationLogo, 'Sanitation');
export const StreetlightIcon = createCategoryIcon(streetlightLogo, 'Street Light');
export const DrainageIcon = createCategoryIcon(drainageLogo, 'Drainage');

export const categoryIcons = {
  water: WaterIcon,
  electricity: ElectricityIcon,
  roads: RoadsIcon,
  sanitation: SanitationIcon,
  drainage: DrainageIcon,
  streetlight: StreetlightIcon,
  other: AlertCircle,
};

export const categoryColors = {
  water: '#2563EB',
  electricity: '#D97706',
  roads: '#EA580C',
  sanitation: '#16A34A',
  drainage: '#0891B2',
  streetlight: '#CA8A04',
  other: '#78716C',
};
