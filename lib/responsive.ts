/**
 * Responsive utilities for device detection and responsive behavior
 */

export const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Check if current width matches breakpoint
 */
export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= breakpoints[breakpoint];
}

/**
 * Check if device is mobile
 */
export function isMobile(width: number): boolean {
  return width < breakpoints.md;
}

/**
 * Check if device is tablet
 */
export function isTablet(width: number): boolean {
  return width >= breakpoints.md && width < breakpoints.lg;
}

/**
 * Check if device is desktop
 */
export function isDesktop(width: number): boolean {
  return width >= breakpoints.lg;
}

/**
 * Get responsive class based on breakpoint
 */
export function getResponsiveClass(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  let classes = mobile;
  if (tablet) classes += ` md:${tablet}`;
  if (desktop) classes += ` lg:${desktop}`;
  return classes;
}



