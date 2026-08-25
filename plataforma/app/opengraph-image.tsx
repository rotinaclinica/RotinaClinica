import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rotina Clínica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #0f2d4a 60%, #0a1e38 100%)",
          padding: "80px 100px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 8,
            height: "100%",
            background: "#3db8d4",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 52 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#3db8d4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <div style={{ width: 28, height: 28, background: "#0f2d4a", borderRadius: 6, display: "flex" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>
              ROTINA CLÍNICA
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <span style={{ color: "#ffffff", fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 0 }}>
            Com você em toda
          </span>
          <span style={{ color: "#3db8d4", fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginBottom: 32 }}>
            a sua trajetória médica.
          </span>
        </div>

        {/* Subtitle */}
        <span style={{ color: "#a8c4d8", fontSize: 28, fontWeight: 400, lineHeight: 1.5, maxWidth: 820 }}>
          Cursos, prescrições, calculadoras e materiais para profissionais da saúde.
        </span>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 100,
            color: "#3db8d4",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          rotinaclinica.com
        </div>
      </div>
    ),
    { ...size }
  );
}
