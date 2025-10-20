"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import DefaultLogo from "@/assets/logo.png";

const ImageWithPlaceholder = ({
  src,
  alt,
  className = "",
  imageClassName = "object-cover",
  priority = false,
}) => {
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const placeholderSrc = webSettings?.web_placeholder_logo || DefaultLogo;

  const [status, setStatus] = useState("loading");
  const [currentSrc, setCurrentSrc] = useState(src);
  const timeoutRef = useRef(null);

  // Reset status and track src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setStatus(src ? "loading" : "error");

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Set timeout for image loading (10 seconds)
      if (src) {
        timeoutRef.current = setTimeout(() => {
          setStatus("error");
        }, 5000);
      }
    }
  }, [src, currentSrc]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleImageLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("loaded");
  };

  const handleImageError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("error");
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder Image */}
      {status !== "loaded" && (
        <Image
          height={0}
          width={0}
          src={placeholderSrc}
          alt="Placeholder"
          className="h-full w-full aspect-video object-contain opacity-40"
          priority={false}
        />
      )}

      {/* Main Image */}
      {src && (
        <Image
          height={0}
          width={0}
          src={src}
          alt={alt}
          priority={priority}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full ${className} ${imageClassName}`}
          key={src} // Force re-render when src changes
        />
      )}
    </div>
  );
};

export default ImageWithPlaceholder;