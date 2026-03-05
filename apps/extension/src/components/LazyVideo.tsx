import React, { useRef, useEffect, useState } from "react";

type LazyVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  src?: string;
  alt?: string;
};

const LazyVideo: React.FC<LazyVideoProps> = ({ src, alt, ...props }) => {
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);
  const videoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ("IntersectionObserver" in window) {
      const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: "100px",
        threshold: 0.0,
      };

      const observerCallback: IntersectionObserverCallback = (
        entries,
        observer
      ) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      };

      const observer = new IntersectionObserver(
        observerCallback,
        observerOptions
      );
      if (videoRef.current) {
        observer.observe(videoRef.current);
      }

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
        observer.disconnect();
      };
    } else {
      setShouldLoad(true);
    }
  }, []);

  return (
    <div ref={videoRef} className="w-full">
      {shouldLoad ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-label={alt}
          width="100%"
          {...props}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          style={{
            height: props.height || "200px",
            width: "100%",
            backgroundColor: "#eee",
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default LazyVideo;
