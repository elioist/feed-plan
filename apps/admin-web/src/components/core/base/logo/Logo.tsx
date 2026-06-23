import logoUrl from '~/assets/images/logo.png';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="Feed Plan"
      style={{ width: size, height: size, borderRadius: 'var(--custom-radius)' }}
    />
  );
}
