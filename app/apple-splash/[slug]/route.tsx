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
  
  if (match) {
    width = parseInt(match[1], 10);
    height = parseInt(match[2], 10);
  }

  let base64Image = "";
  try {
    const imagePath = path.join(process.cwd(), "public", "cardamomBun.png");
    const imageBuffer = fs.readFileSync(imagePath);
    base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading cardamomBun.png for splash screen:", error);
  }

  // Load custom Kate-Bold font from app/fonts/
  let fontData: Buffer | null = null;
  try {
    const fontPath = path.join(process.cwd(), "app", "fonts", "Kate-Bold.ttf");
    fontData = fs.readFileSync(fontPath);
  } catch (error) {
    console.error("Error reading Kate-Bold.ttf font for splash screen:", error);
  }

  const fontsOption = fontData ? [{
    name: "Kate",
    data: fontData,
    weight: 700 as const,
    style: "normal" as const,
  }] : [];

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
          backgroundColor: "#faf8f5", // Always light warm paper background for branding consistency
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
                width: "220px", // Larger bun icon (was 160px)
                height: "220px",
                marginBottom: "24px",
              }}
            />
          )}
          <div
            style={{
              fontFamily: "Kate, serif", // Match fika's signature branding font
              fontSize: "88px", // Larger branding text (was 64px)
              fontWeight: "bold",
              color: "#34261b", // Always deep coffee brown text for contrast
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
      fonts: fontsOption,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
