import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Condutas Clínicas — Rotina Clínica";
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
        <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: "100%", background: "#3db8d4" }} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: 52 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#3db8d4", marginRight: 14, display: "flex" }} />
          <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>ROTINA CLÍNICA</span>
        </div>

        <span style={{ color: "#3db8d4", fontSize: 22, fontWeight: 600, letterSpacing: 3, marginBottom: 20 }}>
          CONDUTAS CLÍNICAS
        </span>

        <span style={{ color: "#ffffff", fontSize: 64, fontWeight: 800, lineHeight: 1.15, marginBottom: 28 }}>
          Mais de 236 prescrições{"\n"}prontas para o plantão.
        </span>

        <span style={{ color: "#a8c4d8", fontSize: 26, fontWeight: 400, lineHeight: 1.5, maxWidth: 780 }}>
          Busque por queixa, diagnóstico ou medicamento — doses, diluições e condutas organizadas por cenário clínico.
        </span>

        <div style={{ position: "absolute", bottom: 52, right: 100, color: "#3db8d4", fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>
          rotinaclinica.com
        </div>
      </div>
    ),
    { ...size }
  );
}
