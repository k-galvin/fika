"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

export interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

function cleanImageUrl(url: SafeImageProps["src"]): SafeImageProps["src"] {
  if (typeof url === "string" && url.includes("/storage/v1/object/sign/images/")) {
    try {
      const urlObj = new URL(url);
      const imagePath = urlObj.pathname.replace(
        /^\/storage\/v1\/object\/sign\/images\//,
        ""
      );
      return `${urlObj.origin}/storage/v1/object/public/images/${imagePath}`;
    } catch {
      return url;
    }
  }
  return url;
}

export function SafeImage({
  src,
  fallbackSrc = "/hotLatte.png",
  alt,
  onError,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const resolvedSrc = cleanImageUrl(src);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : resolvedSrc}
      alt={alt}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
    />
  );
}
