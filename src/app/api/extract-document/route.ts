import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { validateFileSize, isPDFMagicBytes, badRequest } from "@/lib/validation";
import { resolveUserTier, unauthorized, paymentRequired } from "@/lib/authGuard";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const tier = await resolveUserTier();
  if (!tier) return unauthorized();
  if (!tier.isPaid) return paymentRequired();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Check file size before reading into memory
    const sizeErr = validateFileSize(file.size);
    if (sizeErr) return badRequest(sizeErr);

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const claimedPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isPdf = claimedPdf && isPDFMagicBytes(buffer);
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx");

    if (claimedPdf && !isPdf) {
      return badRequest(
        "The uploaded file does not appear to be a valid PDF. Please upload a genuine PDF document."
      );
    }

    if (isPdf) {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      text = data.text;
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a PDF or Word (.docx) document.",
        },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json(
        {
          error:
            "Could not extract any text from this file. It may be scanned or image-based. Please paste the text manually instead.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: trimmed });
  } catch (error) {
    console.error("extract-document error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to read the file. Please try again or paste the text manually.",
      },
      { status: 500 }
    );
  }
}
