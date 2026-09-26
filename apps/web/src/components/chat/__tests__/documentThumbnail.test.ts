import { describe, it, expect } from "vitest";

describe("Document name & extension parsing logic", () => {
  const parseDocExtension = (name?: string) => {
    const safeName = typeof name === "string" && name.trim() ? name : "Document";
    return safeName.includes(".")
      ? safeName.split(".").pop()?.toUpperCase() || "DOC"
      : "DOC";
  };

  const getSafeDocName = (doc: { name?: string; file_name?: string }) => {
    return doc.name || doc.file_name || "Document";
  };

  it("handles valid filename with extension", () => {
    expect(parseDocExtension("lab_results.pdf")).toBe("PDF");
    expect(parseDocExtension("chest_xray.JPEG")).toBe("JPEG");
    expect(parseDocExtension("discharge_summary.final.docx")).toBe("DOCX");
  });

  it("handles undefined, null, or empty string names without throwing", () => {
    expect(parseDocExtension(undefined)).toBe("DOC");
    expect(parseDocExtension("")).toBe("DOC");
    expect(parseDocExtension("   ")).toBe("DOC");
    expect(parseDocExtension("unnamed_file")).toBe("DOC");
  });

  it("extracts safe document name from varying database structures", () => {
    expect(getSafeDocName({ name: "record.pdf" })).toBe("record.pdf");
    expect(getSafeDocName({ file_name: "discharge.pdf" })).toBe("discharge.pdf");
    expect(getSafeDocName({})).toBe("Document");
  });
});

describe("Clinical draft content safe parsing", () => {
  const parseDraftContent = (content: unknown) => {
    if (typeof content === "string") {
      try {
        return JSON.parse(content);
      } catch {
        return { raw: content };
      }
    }
    if (content && typeof content === "object") {
      return content;
    }
    return {};
  };

  it("safely parses JSON strings and objects", () => {
    const stringified = JSON.stringify({ diagnoses: { principal_diagnosis: "Asthma" } });
    expect(parseDraftContent(stringified)).toEqual({ diagnoses: { principal_diagnosis: "Asthma" } });

    const obj = { diagnoses: { principal_diagnosis: "Pneumonia" } };
    expect(parseDraftContent(obj)).toEqual(obj);

    expect(parseDraftContent("invalid json string")).toEqual({ raw: "invalid json string" });
    expect(parseDraftContent(null)).toEqual({});
    expect(parseDraftContent(undefined)).toEqual({});
  });
});
