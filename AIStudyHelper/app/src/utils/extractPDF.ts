import pdfParse = require('pdf-parse');

export default async function extractPDF(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
