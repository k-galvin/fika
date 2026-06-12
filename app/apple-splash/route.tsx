import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Force standard Node.js runtime so we can read files from disk safely
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wStr = searchParams.get("w");
  const hStr = searchParams.get("h");

  const width = wStr ? parseInt(wStr, 10) : 1179;
  const height = hStr ? parseInt(hStr, 10) : 2556;

  let base64Image = "";
  try {
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
          backgroundColor: "#faf8f5",
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
              color: "#34261b",
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
