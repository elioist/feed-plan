interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  return (
    <div className="brand-logo" style={{ width: size, height: size }}>
      F
    </div>
  );
}
