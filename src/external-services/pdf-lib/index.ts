import fs from 'fs';
import { PDFDocument, PDFCheckBox, PDFRadioGroup, PDFTextField, PDFForm, PDFField, PDFImage, PDFPage } from 'pdf-lib';
import CloudStorageService from '../google-cloud-storage';

interface SwornStatementData {
  [key: string]: string | number | boolean | Buffer;
}

class PDFManipulator {
  public static async listPdfFields(pdfPath: string): Promise<string[]> {
    const existingPdfBytes: Buffer = fs.readFileSync(pdfPath);
    const pdfDoc: PDFDocument = await PDFDocument.load(existingPdfBytes);
    const form: PDFForm = pdfDoc.getForm();
    const fields: PDFField[] = form.getFields();
    const fieldNames: string[] = fields.map((field) => field.getName());

    return fieldNames;
  }

  public static async fillPdf(templatePath: string, outputPath: string, data: SwornStatementData): Promise<void> {
    const existingPdfBytes: Buffer = fs.readFileSync(templatePath);
    const pdfDoc: PDFDocument = await PDFDocument.load(existingPdfBytes);
    const form: PDFForm = pdfDoc.getForm();

    Object.keys(data).forEach(async (key) => {
      const value = data[key];

      const field: PDFField = form.getField(key);

      if (field instanceof PDFTextField) {
        field.setFontSize(10);
        field.setText(String(value));
      } else if (field instanceof PDFCheckBox) {
        if (typeof value === 'boolean') {
          if (value) {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (typeof value === 'string') {
          if (value.toLowerCase() === 'true' || value === '1') {
            field.check();
          } else {
            field.uncheck();
          }
        }
      } else if (field instanceof PDFRadioGroup) {
        if (typeof value === 'boolean') {
          const optionName = value ? 'true' : 'false';
          field.select(optionName);
        }
      } else if (Buffer.isBuffer(value)) {
        await this.insertImage(pdfDoc, field, value);
      }
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
  }

  private static async insertImage(pdfDoc: PDFDocument, field: any, imageBuffer: Buffer): Promise<PDFDocument> {
    const image: PDFImage = await pdfDoc.embedPng(imageBuffer);

    const { width, height } = image.scale(1);
    const imageSize = { height, width };

    field.setImage(image, imageSize);

    return pdfDoc;
  }

  public static async mergePdfs(urls: string[], outputPath: string): Promise<string> {
    const pdfDoc: PDFDocument = await PDFDocument.create();

    for (const url of urls) {
      const pdfBytes: Uint8Array = await CloudStorageService.downloadFile(url);
      const pdfDocToMerge: PDFDocument = await PDFDocument.load(pdfBytes);
      const copiedPages: PDFPage[] = await pdfDoc.copyPages(pdfDocToMerge, pdfDocToMerge.getPageIndices());
      copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const mergedPdfBytes: Uint8Array = await pdfDoc.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    return outputPath;
  }
}

export default PDFManipulator;
