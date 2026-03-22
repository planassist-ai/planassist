import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx");

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
