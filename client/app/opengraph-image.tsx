import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flowbill – Freelancer Time Tracking & Invoicing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e0a3c 0%, #2d1560 40%, #1e2a6e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.15)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.15)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(139, 92, 246, 0.3)",
              border: "1px solid rgba(139, 92, 246, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 24, height: 24, background: "#a78bfa", borderRadius: 4, display: "flex" }} />
          </div>
          <span style={{ color: "white", fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            Flowbill
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: 100,
              padding: "8px 20px",
              width: "fit-content",
            }}
          >
            <span style={{ color: "#c4b5fd", fontSize: 16, fontWeight: 500 }}>
              Free to get started · No credit card required
            </span>
          </div>

          <h1
            style={{
              color: "white",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -2,
              margin: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            Run your freelance
            <span style={{ color: "#a78bfa" }}>business smarter.</span>
          </h1>

          <p
            style={{
              color: "rgba(196, 181, 253, 0.75)",
              fontSize: 22,
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 680,
            }}
          >
            Time tracking, invoicing, client & project management — all in one clean workspace.
          </p>
        </div>

        {/* Bottom stats */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { value: "1-click", label: "Invoice generation" },
            { value: "< 10 min", label: "Daily admin time" },
            { value: "Free", label: "To get started" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "16px 28px",
              }}
            >
              <span style={{ color: "white", fontSize: 26, fontWeight: 700 }}>{stat.value}</span>
              <span style={{ color: "rgba(196, 181, 253, 0.6)", fontSize: 14 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
