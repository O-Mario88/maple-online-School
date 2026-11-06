import { MapleLogo } from '@/components/brand/MapleLogo';

/** Maple's mark: the maple leaf and book from the Maple Online School logo. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return <MapleLogo size={size} markOnly />;
}
