import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#ff5c16",
          color: "white",
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  );
}
