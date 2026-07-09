import Image from "next/image";

// Shared product image: serves resized AVIF/WebP via the Vercel image
// optimizer instead of the raw multi-MB PNGs. Parent element must be
// `position: relative` with a fixed aspect ratio. Remote URLs (possible via
// the admin CMS frontmatter) skip optimization since their hosts aren't in
// remotePatterns.
export function ProductImage({
  src,
  alt,
  sizes,
  className = "",
  preload = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      unoptimized={src.startsWith("http")}
      className={`object-cover ${className}`}
    />
  );
}
