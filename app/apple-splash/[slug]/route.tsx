import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Force standard Node.js runtime so we can read files from disk safely
export const runtime = "nodejs";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  
  // Parse dimensions and color scheme from paths like "1179x2556-dark.png" or "1179x2556-light.png"
  const match = slug.match(/^(\d+)x(\d+)(?:-(light|dark))?\.png$/);
  
  let width = 1179;
  let height = 2556;
  let isDark = false;
  
  if (match) {
    width = parseInt(match[1], 10);
    height = parseInt(match[2], 10);
    isDark = match[3] === "dark";
  }

  let base64Image = "";
  try {
    // We can use a different icon for dark mode if it exists, but the cardamom bun looks great on dark too
    const imagePath = path.join(process.cwd(), "public", "cardamomBun.png");
    const imageBuffer = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading cardamomBun.png for splash screen:", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#0a0a0a" : "#faf8f5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-40px)",
          }}
        >
          {base64Image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={base64Image}
              alt="fika icon"
              style={{
                width: "160px",
                height: "160px",
                marginBottom: "20px",
              }}
            />
          )}
          <div
            style={{
              fontFamily: "serif",
              fontSize: "64px",
              fontWeight: "bold",
              color: isDark ? "#f5f5f5" : "#34261b",
              letterSpacing: "-0.05em",
            }}
          >
            fika
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
