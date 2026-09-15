/**
 * HeroSlider — AM Enterprises
 * ─────────────────────────────────────────────────────────────────────────────
 * HERO:
 * - Full-section background image
 * - Background image with premium white/blue overlay
 * - Animated heading
 * - Typewriter accent text
 * - Floating information cards
 * - Scroll parallax
 * - Responsive mobile layout
 * - Feature cards
 *
 * IMPORTANT:
 * Background image:
 *   src/assets/hero-bg.jpg
 *
 * You can replace hero-bg.jpg with any image you want.
 * Recommended image:
 * - Wide landscape image
 * - High resolution
 * - 1600px+ width
 * - Technology / digital / abstract / software visual
 * - Avoid images with important text in the center
 */

import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ============================================================================
   HERO ASSETS
   ============================================================================ */

/*
 * FULL HERO BACKGROUND IMAGE
 *
 * Put your image here:
 *
 * src/assets/hero-bg.jpg
 *
 * If your image is PNG/WebP, simply change the extension:
 *
 * import heroBackground from "@/assets/hero-bg.webp";
 */
import heroBackground from "@/assets/herobg.png";

/*
 * EXISTING HERO VIDEO
 *
 * The video on the right side is NOT removed.
 */
import heroVideo from "@/assets/hero.mp4";

/* ============================================================================
   CONTACT
   ============================================================================ */

const PHONE_PK = "+923173712950";
const PHONE_PK_DISP = "+92 317 371 2950";

/* ============================================================================
   TYPEWRITER WORDS
   ============================================================================ */

const ACCENT_WORDS = [
  "Digital Excellence.",
  "Business Growth.",
  "Scalable Products.",
  "Real Impact.",
];

/* ============================================================================
   TYPEWRITER
   ============================================================================ */

function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = ACCENT_WORDS[idx % ACCENT_WORDS.length];

    const delay = deleting ? 40 : 85;

    const timer = window.setTimeout(() => {
      if (!deleting) {
        const next = word.slice(0, txt.length + 1);

        setTxt(next);

        if (next === word) {
          window.setTimeout(() => {
            setDeleting(true);
          }, 1800);
        }
      } else {
        const next = word.slice(
          0,
          Math.max(0, txt.length - 1)
        );

        setTxt(next);

        if (next === "") {
          setDeleting(false);
          setIdx((value) => value + 1);
        }
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [txt, deleting, idx]);

  return (
    <span className="text-[#4BAFE8]">
      {txt}

      <span
        className="
          ml-1
          inline-block
          h-[0.9em]
          w-[3px]
          translate-y-[2px]
          animate-pulse
          rounded-sm
          bg-[#20BFEA]
          align-middle
        "
        aria-hidden="true"
      />
    </span>
  );
}

/* ============================================================================
   ANIMATION LINE
   ============================================================================ */

function AnimLine({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delay + 100);

    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={`block overflow-hidden ${className}`}
    >
      <span
        className={`
          block
          transition-all
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }
        `}
      >
        {children}
      </span>
    </span>
  );
}

/* ============================================================================
   FEATURE PILL
   ============================================================================ */

function FeaturePill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        group
        flex
        flex-col
        items-center
        gap-3
        rounded-2xl
        border
        border-[#D8EAF3]
        bg-white
        px-5
        py-6
        text-center
        shadow-soft
        transition
        duration-300
        hover:-translate-y-1.5
        hover:border-[#4BAFE8]/40
        hover:shadow-luxury
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-[#EAF7FF]
          text-[#4BAFE8]
          transition
          duration-300
          group-hover:scale-110
        "
      >
        {icon}
      </div>

      <div>
        <p className="font-display text-sm font-black text-[#12344D]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-[#526273]">
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   HERO COMPONENT
   ============================================================================ */

export function HeroSlider() {
  const sceneRef = useRef<HTMLDivElement>(null);

  /* --------------------------------------------------------------------------
     SCROLL PARALLAX
     -------------------------------------------------------------------------- */

  useEffect(() => {
    const onScroll = () => {
      if (!sceneRef.current) return;

      const y = window.scrollY;

      sceneRef.current.style.transform = `translateY(${y * 0.06}px)`;
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* --------------------------------------------------------------------------
     RENDER
     -------------------------------------------------------------------------- */

  return (
    <>
      {/* ======================================================================
          HERO ANIMATIONS
          ====================================================================== */}

      <style>{`
        /* --------------------------------------------------------------------
           MAIN HERO FLOAT
           -------------------------------------------------------------------- */

        @keyframes heroFloat {
          0%,
          100% {
            transform:
              translateY(0px)
              rotateX(0deg)
              rotateY(0deg)
              rotateZ(0deg)
              scale(1);
          }

          50% {
            transform:
              translateY(-16px)
              rotateX(2deg)
              rotateY(-2deg)
              rotateZ(0.5deg)
              scale(1.015);
          }
        }

        /* --------------------------------------------------------------------
           FLOATING CARD 1
           -------------------------------------------------------------------- */

        @keyframes heroFloatCard1 {
          0%,
          100% {
            transform:
              translateZ(20px)
              translateY(0px)
              rotate(-1deg);
          }

          50% {
            transform:
              translateZ(40px)
              translateY(-12px)
              rotate(2deg);
          }
        }

        /* --------------------------------------------------------------------
           FLOATING CARD 2
           -------------------------------------------------------------------- */

        @keyframes heroFloatCard2 {
          0%,
          100% {
            transform:
              translateZ(30px)
              translateY(0px)
              rotate(1deg);
          }

          50% {
            transform:
              translateZ(50px)
              translateY(-10px)
              rotate(-1deg);
          }
        }

        /* --------------------------------------------------------------------
           FLOATING CARD 3
           -------------------------------------------------------------------- */

        @keyframes heroFloatCard3 {
          0%,
          100% {
            transform:
              translateZ(10px)
              translateY(0px)
              rotate(-0.5deg);
          }

          50% {
            transform:
              translateZ(35px)
              translateY(-14px)
              rotate(1deg);
          }
        }

        /* --------------------------------------------------------------------
           GENERAL HERO GLOW
           -------------------------------------------------------------------- */

        @keyframes heroGlow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }

          50% {
            opacity: 0.72;
            transform: scale(1.06);
          }
        }

        /* --------------------------------------------------------------------
           VIDEO GLOW
           -------------------------------------------------------------------- */

        @keyframes videoGlow {
          0%,
          100% {
            box-shadow:
              0 30px 80px rgba(75, 175, 232, 0.12),
              0 10px 30px rgba(18, 52, 77, 0.08);
          }

          50% {
            box-shadow:
              0 40px 100px rgba(75, 175, 232, 0.22),
              0 15px 40px rgba(18, 52, 77, 0.12);
          }
        }

        /* --------------------------------------------------------------------
           BACKGROUND IMAGE SLOW ZOOM

           This gives the hero background a very subtle premium movement.
           It is intentionally slow so it doesn't distract from the content.
           -------------------------------------------------------------------- */

        @keyframes heroBackgroundZoom {
          0%,
          100% {
            transform: scale(1.02);
          }

          50% {
            transform: scale(1.06);
          }
        }

        /* --------------------------------------------------------------------
           REDUCED MOTION
           -------------------------------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* ======================================================================
          HERO SECTION

          IMPORTANT:
          The background image is NOT applied directly to this section.

          Instead:
          1. Background image layer
          2. Premium color overlay
          3. Soft glow layer
          4. Actual content

          This gives us much better control over readability.
          ====================================================================== */}

      <section
        className="
          relative
          isolate
          overflow-hidden
          bg-white
          pt-24
          pb-0
        "
        aria-label="AM Enterprises hero"
      >

        {/* ====================================================================
            FULL HERO BACKGROUND IMAGE

            This layer covers the ENTIRE hero section.

            object-cover equivalent:
            - width 100%
            - height 100%
            - image stays centered
            - image automatically crops where necessary

            The image is slightly zoomed for a premium cinematic effect.
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            -z-30
            overflow-hidden
          "
          aria-hidden="true"
        >
          <img
            src={heroBackground}
            alt=""
            className="
              h-full
              w-full
              object-cover
              object-center
              opacity-[94]
            "
            style={{
              animation:
                "heroBackgroundZoom 18s ease-in-out infinite",
            }}
          />
        </div>

        {/* ====================================================================
            PREMIUM WHITE / ICE-BLUE OVERLAY

            IMPORTANT:

            We don't want the background image to overpower the content.

            The gradient:
            - keeps left side brighter for text
            - allows image to remain visible
            - adds very light blue premium tone
            - keeps the website in your chosen light theme

            You can increase/decrease image visibility by changing opacity
            above OR these gradient percentages.
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            -z-20
            bg-gradient-to-r
            from-white
            via-white/90
            to-[#EAF7FF]/92
          "
          aria-hidden="true"
        />

        {/* ====================================================================
            SECONDARY SOFT BLUE OVERLAY

            This gives the right side a little more technology / digital feel
            without making the hero dark.
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            -z-10
            bg-gradient-to-br
            from-transparent
            via-transparent
            to-[#BDE7FF]/70
          "
          aria-hidden="true"
        />

        {/* ====================================================================
            DOT GRID

            Very subtle grid remains above the background image.

            It adds a technology feel while remaining almost invisible.
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            -z-[5]
            opacity-[0.035]
          "
          style={{
            backgroundImage:
              "radial-gradient(circle, #12344D 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        {/* ====================================================================
            TOP RIGHT GLOW
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-48
            -top-48
            -z-[5]
            h-[700px]
            w-[700px]
            rounded-full
            bg-[#EAF7FF]
          "
          style={{
            animation:
              "heroGlow 6s ease-in-out infinite",
            filter: "blur(80px)",
          }}
          aria-hidden="true"
        />

        {/* ====================================================================
            BOTTOM LEFT GLOW
            ==================================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-32
            -z-[5]
            h-[400px]
            w-[400px]
            rounded-full
            bg-[#EAF7FF]
            blur-3xl
            opacity-70
          "
          aria-hidden="true"
        />

        {/* ====================================================================
            MAIN CONTAINER
            ==================================================================== */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-[1280px]
            px-6
            sm:px-8
          "
        >
          <div
            className="
              grid
              min-h-[88vh]
              grid-cols-1
              items-center
              gap-10
              lg:grid-cols-2
              lg:gap-12
            "
          >

            {/* ================================================================
                LEFT COLUMN
                ================================================================ */}

            <div
              className="
                pb-10
                pt-12
                lg:py-20
              "
            >

              {/* ==============================================================
                  EYEBROW
                  ============================================================== */}

              <AnimLine delay={0}>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.32em]
                    text-[#4BAFE8]
                  "
                >
                  Ideas · Innovation · Impact
                </p>
              </AnimLine>

              {/* ==============================================================
                  HEADLINE
                  ============================================================== */}

              <h1 className="mt-5">

                <AnimLine
                  delay={80}
                  className="
                    font-display
                    text-[38px]
                    font-black
                    leading-[1.05]
                    tracking-tight
                    text-[#12344D]
                    sm:text-5xl
                    lg:text-[56px]
                    xl:text-[64px]
                  "
                >
                  Transforming Ideas Into
                </AnimLine>

                <AnimLine
                  delay={180}
                  className="
                    min-h-[1.1em]
                    font-display
                    text-[38px]
                    font-black
                    leading-[1.05]
                    tracking-tight
                    sm:text-5xl
                    lg:text-[56px]
                    xl:text-[64px]
                  "
                >
                  <Typewriter />
                </AnimLine>

              </h1>

              {/* ==============================================================
                  UNDERLINE
                  ============================================================== */}

              <AnimLine
                delay={280}
                className="mt-3"
              >
                <svg
                  width="140"
                  height="10"
                  viewBox="0 0 140 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7 C25 2, 50 9, 75 5 S105 2, 138 6"
                    stroke="#20BFEA"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </AnimLine>

              {/* ==============================================================
                  DESCRIPTION
                  ============================================================== */}

              <AnimLine
                delay={360}
                className="mt-6"
              >
                <p
                  className="
                    max-w-[500px]
                    text-base
                    leading-[1.75]
                    text-[#526273]
                    sm:text-lg
                  "
                >
                  We craft scalable, high-performance software
                  solutions that drive growth, engage users, and
                  create real impact.
                </p>
              </AnimLine>

              {/* ==============================================================
                  CTA
                  ============================================================== */}

              <AnimLine
                delay={440}
                className="mt-9"
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-4
                  "
                >

                  {/* ==========================================================
                      PRIMARY CTA
                      ========================================================== */}

                  <Link
                    to="/contact"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#12344D]
                      px-7
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-soft
                      transition
                      duration-300
                      hover:scale-[1.03]
                      hover:bg-[#4BAFE8]
                      hover:shadow-luxury
                    "
                  >
                    Start Your Project

                    <ArrowRight
                      className="h-4 w-4"
                    />
                  </Link>

                  {/* ==========================================================
                      SECONDARY CTA
                      ========================================================== */}

                  <Link
                    to="/portfolio"
                    className="
                      inline-flex
                      items-center
                      gap-2.5
                      text-sm
                      font-semibold
                      text-[#12344D]
                      transition
                      hover:text-[#4BAFE8]
                    "
                  >
                    <span
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-[#4BAFE8]
                        text-[#4BAFE8]
                        transition
                        duration-300
                        hover:bg-[#4BAFE8]
                        hover:text-white
                      "
                    >
                      <Play
                        className="
                          h-3.5
                          w-3.5
                          fill-current
                        "
                      />
                    </span>

                    Explore Our Work
                  </Link>

                </div>
              </AnimLine>

              {/* ==============================================================
                  TRUST STATS
                  ============================================================== */}

              <AnimLine
                delay={520}
                className="mt-11"
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-7
                    border-t
                    border-[#D8EAF3]
                    pt-7
                    sm:gap-8
                  "
                >

                  {[
                    {
                      val: "200+",
                      label: "Projects Delivered",
                    },
                    {
                      val: "5+",
                      label: "Years Experience",
                    },
                    {
                      val: "98%",
                      label: "Client Retention",
                    },
                    {
                      val: "24/7",
                      label: "Support",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                    >
                      <p
                        className="
                          font-display
                          text-2xl
                          font-black
                          text-[#12344D]
                        "
                      >
                        {stat.val}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-widest
                          text-[#526273]
                        "
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}

                </div>
              </AnimLine>

            </div>

            {/* ================================================================
                RIGHT COLUMN
                ================================================================ */}

            <div
              ref={sceneRef}
              className="
                relative
                min-h-[500px]
                lg:min-h-[560px]
              "
              style={{
                perspective: "1100px",
                willChange: "transform",
              }}
            >

              {/* ==============================================================
                  AMBIENT GLOW
                  ============================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[460px]
                  w-[460px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                "
                style={{
                  background:
                    "radial-gradient(circle, #EAF7FF 0%, #BDE7FF 42%, transparent 75%)",
                  animation:
                    "heroGlow 5s ease-in-out infinite",
                }}
                aria-hidden="true"
              />

              {/* ==============================================================
                  VIDEO CONTAINER
                  ============================================================== */}

              <div
                className="
                  relative
                  z-10
                  mx-auto
                  w-full
                  max-w-[560px]
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-[#D8EAF3]
                  bg-[#EAF7FF]
                "
                style={{
                  animation:
                    "heroFloat 6s ease-in-out infinite, videoGlow 5s ease-in-out infinite",
                  transformStyle: "preserve-3d",
                }}
              >

                {/* ============================================================
                    HERO VIDEO

                    Existing video is preserved.
                    ============================================================ */}

                <video
                  src={heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="
                    block
                    h-auto
                    min-h-[360px]
                    w-full
                    object-cover
                    object-center
                  "
                  aria-label="AM Enterprises digital technology showcase"
                />

                {/* ============================================================
                    VIDEO OVERLAY

                    Light blue overlay keeps the video integrated with the
                    new hero background.
                    ============================================================ */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-tr
                    from-[#12344D]/10
                    via-transparent
                    to-[#20BFEA]/10
                  "
                  aria-hidden="true"
                />

              </div>

              {/* ==============================================================
                  FLOATING CARD 1
                  ============================================================== */}

              <div
                className="
                  absolute
                  right-0
                  top-10
                  z-20
                  flex
                  flex-col
                  items-center
                  rounded-2xl
                  border
                  border-[#D8EAF3]
                  bg-white/95
                  px-5
                  py-4
                  text-center
                  shadow-luxury
                  backdrop-blur-sm
                  transition-transform
                  duration-500
                  hover:scale-105
                "
                style={{
                  animation:
                    "heroFloatCard1 4s ease-in-out infinite",
                  animationDelay: "0.4s",
                }}
              >

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF7FF]
                  "
                >
                  <Star
                    className="
                      h-4
                      w-4
                      fill-[#4BAFE8]
                      text-[#4BAFE8]
                    "
                  />
                </div>

                <p
                  className="
                    mt-2
                    text-[11px]
                    font-black
                    leading-snug
                    text-[#12344D]
                  "
                >
                  We Build
                  <br />
                  Impactful
                  <br />
                  Solutions
                </p>

              </div>

              {/* ==============================================================
                  FLOATING CARD 2
                  ============================================================== */}

              <div
                className="
                  absolute
                  bottom-16
                  left-0
                  z-20
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[#D8EAF3]
                  bg-white/95
                  px-4
                  py-3.5
                  shadow-luxury
                  backdrop-blur-sm
                  transition-transform
                  duration-500
                  hover:scale-105
                "
                style={{
                  animation:
                    "heroFloatCard2 3.6s ease-in-out infinite",
                  animationDelay: "1s",
                }}
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF7FF]
                  "
                >
                  <Zap
                    className="
                      h-5
                      w-5
                      text-[#4BAFE8]
                    "
                  />
                </div>

                <div>

                  <p
                    className="
                      text-[11px]
                      font-black
                      text-[#12344D]
                    "
                  >
                    Web App Development
                  </p>

                  <p
                    className="
                      text-[10px]
                      leading-snug
                      text-[#526273]
                    "
                  >
                    Modern, scalable web
                    <br />
                    applications.
                  </p>

                </div>

              </div>

              {/* ==============================================================
                  FLOATING CARD 3
                  ============================================================== */}

              <div
                className="
                  absolute
                  bottom-32
                  right-2
                  z-20
                  flex
                  items-center
                  gap-2.5
                  rounded-2xl
                  border
                  border-[#D8EAF3]
                  bg-white/95
                  px-4
                  py-3
                  shadow-luxury
                  backdrop-blur-sm
                  transition-transform
                  duration-500
                  hover:scale-105
                "
                style={{
                  animation:
                    "heroFloatCard3 4.4s ease-in-out infinite",
                  animationDelay: "0.7s",
                }}
              >

                <CheckCircle
                  className="
                    h-5
                    w-5
                    shrink-0
                    text-[#22C55E]
                  "
                />

                <div>

                  <p
                    className="
                      text-[11px]
                      font-black
                      text-[#12344D]
                    "
                  >
                    Trusted Partner
                  </p>

                  <p
                    className="
                      text-[10px]
                      text-[#526273]
                    "
                  >
                    Islamabad · UK
                  </p>

                </div>

              </div>

              {/* ==============================================================
                  ORBIT RING 1
                  ============================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[420px]
                  w-[420px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                "
                style={{
                  border:
                    "1.5px dashed #D8EAF3",
                  opacity: 0.7,
                }}
                aria-hidden="true"
              />

              {/* ==============================================================
                  ORBIT RING 2
                  ============================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-[320px]
                  w-[320px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                "
                style={{
                  border:
                    "1.5px dashed #BDE7FF",
                  opacity: 0.6,
                }}
                aria-hidden="true"
              />

            </div>

          </div>
        </div>

        {/* ====================================================================
            FEATURE STRIP

            Kept white so the hero background image doesn't visually continue
            into the next section.
            ==================================================================== */}

        <div
          className="
            relative
            z-10
            border-t
            border-[#D8EAF3]
            bg-white
          "
        >

          <div
            className="
              mx-auto
              max-w-[1280px]
              px-6
              py-8
              sm:px-8
            "
          >

            <div
              className="
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-4
              "
            >

              {/* ==============================================================
                  FEATURE 1
                  ============================================================== */}

              <FeaturePill
                icon={<RocketSvg />}
                title="Scalable Solutions"
                desc="Built to grow with your business effortlessly."
              />

              {/* ==============================================================
                  FEATURE 2
                  ============================================================== */}

              <FeaturePill
                icon={<ShieldSvg />}
                title="High Performance"
                desc="Optimized for speed, security & reliability."
              />

              {/* ==============================================================
                  FEATURE 3
                  ============================================================== */}

              <FeaturePill
                icon={<UsersSvg />}
                title="User-Centric"
                desc="Designed for seamless and delightful experiences."
              />

              {/* ==============================================================
                  FEATURE 4
                  ============================================================== */}

              <FeaturePill
                icon={<SupportSvg />}
                title="End-to-End Support"
                desc="From idea to deployment and beyond."
              />

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

/* ============================================================================
   ROCKET SVG
   ============================================================================ */

function RocketSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        d="
          M4.5 16.5
          c-1.5 1.26-2 5-2 5
          s3.74-.5 5-2
          c.71-.84.7-2.13-.09-2.91
          a2.18 2.18 0 00-2.91-.09z
        "
      />

      <path
        d="
          M12 15l-3-3
          a22 22 0 012-3.95
          A12.88 12.88 0 0122 2
          c0 2.72-.78 7.5-6 11
          a22.35 22.35 0 01-4 2z
        "
      />

      <path
        d="
          M9 12H4
          s.55-3.03 2-4
          c1.62-1.08 5 0 5 0
        "
      />

      <path
        d="
          M12 15v5
          s3.03-.55 4-2
          c1.08-1.62 0-5 0-5
        "
      />
    </svg>
  );
}

/* ============================================================================
   SHIELD SVG
   ============================================================================ */

function ShieldSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        d="
          M12 22
          s8-4 8-10
          V5
          l-8-3
          -8 3
          v7
          c0 6 8 10 8 10z
        "
      />

      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ============================================================================
   USERS SVG
   ============================================================================ */

function UsersSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        d="
          M17 21v-2
          a4 4 0 00-4-4
          H5
          a4 4 0 00-4 4
          v2
        "
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        d="
          M23 21v-2
          a4 4 0 00-3-3.87
          M16 3.13
          a4 4 0 010 7.75
        "
      />
    </svg>
  );
}

/* ============================================================================
   SUPPORT SVG
   ============================================================================ */

function SupportSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        d="
          M3 18v-6
          a9 9 0 0118 0
          v6
        "
      />

      <path
        d="
          M21 19
          a2 2 0 01-2 2
          h-1
          a2 2 0 01-2-2
          v-3
          a2 2 0 012-2
          h3z

          M3 19
          a2 2 0 002 2
          h1
          a2 2 0 002-2
          v-3
          a2 2 0 00-2-2
          H3z
        "
      />
    </svg>
  );
}
