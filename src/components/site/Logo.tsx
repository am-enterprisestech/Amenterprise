export function Logo({
  className = "h-10 w-auto",
  variant = "default",
  showText = true,
}: {
  className?: string;
  variant?: "default" | "light";
  showText?: boolean;
}) {
  const isLight = variant === "light";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2.5
        shrink-0
        ${isLight ? "text-white" : "text-espresso"}
      `}
    >
      {/* ================================================================
          AM ENTERPRISES LOGO MARK

          IMPORTANT:
          - Logo image is loaded from /public/logo.png
          - Keep logo.png inside the project's /public folder
          - Example:
            public/
              logo.png
        ================================================================ */}

      <img
        src="/logo.png"
        alt="AM Enterprises"
        width={40}
        height={40}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={`
          ${className}
          shrink-0
          object-contain
        `}
      />

      {/* ================================================================
          BRAND NAME

          Uses existing theme classes:
          - text-espresso → deep navy
          - text-cocoa    → brand blue
        ================================================================ */}

      {showText && (
        <span
          className="
            whitespace-nowrap
            font-display
            text-lg
            font-bold
            leading-none
            tracking-tight
            sm:text-xl
          "
        >
          AM{" "}
          <span
            className="
              font-medium
              text-cocoa
            "
          >
            Enterprises
          </span>
        </span>
      )}
    </span>
  );
}
