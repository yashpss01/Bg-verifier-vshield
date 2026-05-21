import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/db';
import PDFDocument from 'pdfkit';

const generatePDFReport = (reportData: any, res: Response) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Stream the PDF directly to the Express response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=BGV_Report_${reportData.candidateName.replace(/\s+/g, '_')}.pdf`);

  doc.pipe(res);

  // Styling Constants
  const primaryColor = '#4f46e5'; // Indigo
  const textColor = '#1f2937'; // Dark Gray
  const lightGray = '#9ca3af';
  const borderLight = '#e5e7eb';

  // 1. Header (VShield Logo & Title)
  doc.fontSize(24).fillColor(primaryColor).text('VShield', 50, 50);
  doc.fontSize(8).fillColor(lightGray).text('BACKGROUND VERIFICATION PLATFORM', 50, 75);

  doc.fontSize(14).fillColor(textColor).text('VERIFICATION REPORT', 320, 50, { align: 'right' });
  doc.fontSize(9).fillColor(lightGray).text(`GENERATED ON: ${reportData.generatedOn}`, 320, 68, { align: 'right' });

  // Horizontal Rule
  doc.moveTo(50, 95).lineTo(545, 95).strokeColor(primaryColor).lineWidth(2).stroke();

  // 2. Candidate Information Title
  doc.fontSize(11).fillColor(primaryColor).text('CANDIDATE INFORMATION', 50, 115);
  doc.moveTo(50, 127).lineTo(545, 127).strokeColor(borderLight).lineWidth(1).stroke();

  // Grid Layout for Candidate Details
  const gridYStart = 140;
  const col1X = 50;
  const col2X = 300;

  // Row 1
  doc.fontSize(8).fillColor(lightGray).text('FULL NAME', col1X, gridYStart);
  doc.fontSize(10).fillColor(textColor).text(reportData.candidateName, col1X, gridYStart + 11);

  doc.fontSize(8).fillColor(lightGray).text('EMAIL ADDRESS', col2X, gridYStart);
  doc.fontSize(10).fillColor(textColor).text(reportData.email, col2X, gridYStart + 11);

  // Row 2
  const gridY2 = gridYStart + 35;
  doc.fontSize(8).fillColor(lightGray).text('PHONE NUMBER', col1X, gridY2);
  doc.fontSize(10).fillColor(textColor).text(reportData.phone, col1X, gridY2 + 11);

  doc.fontSize(8).fillColor(lightGray).text('DATE OF BIRTH', col2X, gridY2);
  doc.fontSize(10).fillColor(textColor).text(reportData.dob, col2X, gridY2 + 11);

  // Row 3 (Address)
  const gridY3 = gridY2 + 35;
  doc.fontSize(8).fillColor(lightGray).text('RESIDENTIAL ADDRESS', col1X, gridY3);
  doc.fontSize(10).fillColor(textColor).text(reportData.address, col1X, gridY3 + 11, { width: 495 });

  // 3. Verification Outcomes
  const verificationYStart = gridY3 + 55;
  doc.fontSize(11).fillColor(primaryColor).text('VERIFICATION OUTCOMES', 50, verificationYStart);
  doc.moveTo(50, verificationYStart + 15).lineTo(545, verificationYStart + 15).strokeColor(borderLight).lineWidth(1).stroke();

  // Verification Details List
  const listYStart = verificationYStart + 30;

  // Aadhaar Block
  doc.fontSize(10).fillColor(textColor).text('Aadhaar Identity Verification', 50, listYStart);
  doc.fontSize(8).fillColor(lightGray).text(`Document Ref: ${reportData.maskedAadhaar}`, 50, listYStart + 11);
  
  // Status Badge for Aadhaar
  const isAadhaarVerified = reportData.aadhaarVerification === 'SUCCESS';
  const aadhaarBadgeColor = isAadhaarVerified ? '#10b981' : (reportData.aadhaarVerification === 'FAILED' ? '#ef4444' : '#6b7280');
  const aadhaarBadgeText = isAadhaarVerified ? 'VERIFIED' : (reportData.aadhaarVerification === 'FAILED' ? 'FAILED' : 'NOT STARTED');

  doc.rect(430, listYStart, 115, 18).fill(aadhaarBadgeColor);
  doc.fontSize(8).fillColor('#ffffff').text(aadhaarBadgeText, 430, listYStart + 5, { width: 115, align: 'center' });

  // PAN Block
  const panYStart = listYStart + 40;
  doc.fontSize(10).fillColor(textColor).text('PAN Registry Authentication', 50, panYStart);
  doc.fontSize(8).fillColor(lightGray).text(`Document Ref: ${reportData.maskedPan}`, 50, panYStart + 11);

  // Status Badge for PAN
  const isPanVerified = reportData.panVerification === 'SUCCESS';
  const panBadgeColor = isPanVerified ? '#10b981' : (reportData.panVerification === 'FAILED' ? '#ef4444' : '#6b7280');
  const panBadgeText = isPanVerified ? 'VERIFIED' : (reportData.panVerification === 'FAILED' ? 'FAILED' : 'NOT STARTED');

  doc.rect(430, panYStart, 115, 18).fill(panBadgeColor);
  doc.fontSize(8).fillColor('#ffffff').text(panBadgeText, 430, panYStart + 5, { width: 115, align: 'center' });

  // 4. Audit Outcome Summary Box
  const summaryYStart = panYStart + 45;
  let summaryBg = '#fdf2f2';
  let summaryBorder = '#fecaca';
  let summaryTextTitleColor = '#991b1b';
  let summaryText = 'The candidate has failed both Aadhaar and PAN verification audits. Background verification clearance is denied.';

  if (reportData.overallStatus === 'VERIFIED') {
    summaryBg = '#ecfdf5';
    summaryBorder = '#a7f3d0';
    summaryTextTitleColor = '#047857';
    summaryText = 'The candidate has successfully cleared identity audits for Aadhaar and PAN records. Background verification clearance is approved.';
  } else if (reportData.overallStatus === 'PARTIAL') {
    summaryBg = '#fffbeb';
    summaryBorder = '#fde68a';
    summaryTextTitleColor = '#a16207';
    summaryText = 'The candidate has achieved partial clearance. One of the verified documents failed authentication. Additional check-ins required.';
  } else if (reportData.overallStatus === 'PENDING') {
    summaryBg = '#e8f0fe';
    summaryBorder = '#ccd7f7';
    summaryTextTitleColor = '#253995';
    summaryText = 'Background verification check is currently in progress. Clearance is pending.';
  }

  // Draw Summary Box
  doc.rect(50, summaryYStart, 495, 45).fillAndStroke(summaryBg, summaryBorder);
  doc.fontSize(9).fillColor(summaryTextTitleColor).text('AUDIT OUTCOME SUMMARY', 62, summaryYStart + 10);
  doc.fontSize(9).fillColor(textColor).text(summaryText, 62, summaryYStart + 22, { width: 470 });

  // 5. Certification Details
  const certYStart = summaryYStart + 65;
  doc.fontSize(11).fillColor(primaryColor).text('CERTIFICATION LOG', 50, certYStart);
  doc.moveTo(50, certYStart + 15).lineTo(545, certYStart + 15).strokeColor(borderLight).lineWidth(1).stroke();

  // Bottom Columns
  const bottomY = certYStart + 25;
  doc.fontSize(8).fillColor(lightGray).text('OVERALL BGV STATUS', col1X, bottomY);
  doc.fontSize(10).fillColor(textColor).text(reportData.overallStatus, col1X, bottomY + 11);

  doc.fontSize(8).fillColor(lightGray).text('REPORT CERTIFIED BY', col2X, bottomY);
  doc.fontSize(10).fillColor(textColor).text(reportData.verifiedBy, col2X, bottomY + 11);

  // 6. Footer (Signature and Auth Code)
  const footerY = 700;
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor(borderLight).lineWidth(1).stroke();

  doc.fontSize(8).fillColor(lightGray).text('DIGITAL FINGERPRINT AUTHORIZATION CODE', 50, footerY + 10);
  doc.fontSize(8).fillColor('#4b5563').text(reportData.digitalSignature, 50, footerY + 22);

  // Signature line
  doc.moveTo(380, footerY + 25).lineTo(540, footerY + 25).strokeColor('#9ca3af').lineWidth(1).stroke();
  doc.fontSize(8).fillColor(lightGray).text(`Certified Signature Mark`, 380, footerY + 30, { width: 160, align: 'center' });

  doc.end();
};


export const getReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { format } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    // Fetch candidate with logs
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        createdById: userId,
      },
      include: {
        verificationLogs: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate report not found.',
      });
    }

    // Extract Aadhaar/PAN validation status
    const aadhaarLog = candidate.verificationLogs.find(log => log.verificationType === 'AADHAAR');
    const panLog = candidate.verificationLogs.find(log => log.verificationType === 'PAN');

    const aadhaarStatus = aadhaarLog ? aadhaarLog.verificationStatus : 'NOT_STARTED';
    const panStatus = panLog ? panLog.verificationStatus : 'NOT_STARTED';

    // Mask sensitive fields
    const maskString = (str: string, visibleCount = 4) => {
      if (!str) return '';
      if (str.length <= visibleCount) return str;
      return 'X'.repeat(str.length - visibleCount) + str.slice(-visibleCount);
    };

    const maskedAadhaar = candidate.aadhaarNumber 
      ? `${candidate.aadhaarNumber.slice(0, 4)}-${candidate.aadhaarNumber.slice(4, 8)}-${candidate.aadhaarNumber.slice(8, 12)}`.replace(/^\d{4}-\d{4}/, 'XXXX-XXXX')
      : 'N/A';
      
    const maskedPan = candidate.panNumber 
      ? candidate.panNumber.replace(/^[A-Z]{5}[0-9]{4}/, 'XXXXX0000') 
      : 'N/A';

    const reportData = {
      candidateName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      dob: candidate.dob.toISOString().split('T')[0],
      address: candidate.address,
      aadhaarVerification: aadhaarStatus,
      maskedAadhaar,
      panVerification: panStatus,
      maskedPan,
      overallStatus: candidate.status,
      generatedOn: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      verifiedBy: req.user?.name || 'Recruiter Admin',
      digitalSignature: `VSHIELD-${candidate.id.slice(0, 8).toUpperCase()}-${Buffer.from(candidate.email).toString('base64').slice(0, 10).toUpperCase()}`,
    };

    // Return PDF if requested
    if (format === 'pdf') {
      return generatePDFReport(reportData, res);
    }

    // Return JSON if requested
    if (format === 'json') {
      return res.status(200).json({
        status: 'success',
        data: reportData,
      });
    }

    // Otherwise render standard printable HTML layout
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Background Verification Report - ${candidate.fullName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background-color: #f9fafb;
          }
          .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 50px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-weight: 800;
            font-size: 24px;
            color: #4f46e5;
            letter-spacing: -0.5px;
          }
          .report-title {
            font-size: 16px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 5px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .field {
            margin-bottom: 12px;
          }
          .label {
            font-size: 12px;
            color: #9ca3af;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 3px;
          }
          .value {
            font-size: 15px;
            font-weight: 500;
            color: #1f2937;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-VERIFIED { background-color: #ecfdf5; color: #059669; }
          .status-FAILED { background-color: #fee2e2; color: #e64949; }
          .status-PARTIAL { background-color: #fffbeb; color: #ca8a04; }
          .status-PENDING { background-color: #e8f0fe; color: #1a73e8; }
          
          .status-SUCCESS { background-color: #ecfdf5; color: #059669; }
          .status-NOT_STARTED { background-color: #f3f4f6; color: #374151; }

          .signature-box {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 30px;
            border-top: 1px solid #f3f4f6;
          }
          .signature-fingerprint {
            font-family: monospace;
            font-size: 11px;
            color: #9ca3af;
            background: #f9fafb;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px dashed #e5e7eb;
          }
          .signature-line {
            text-align: center;
            width: 200px;
          }
          .signature-line-mark {
            border-bottom: 1px solid #9ca3af;
            height: 40px;
            margin-bottom: 8px;
          }
          .print-btn {
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
            transition: all 0.2s;
            margin-bottom: 20px;
          }
          .print-btn:hover {
            background-color: #4338ca;
          }
          @media print {
            body {
              background-color: white;
              padding: 0;
            }
            .report-container {
              box-shadow: none;
              border: none;
              padding: 0;
              max-width: 100%;
            }
            .print-btn {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto; text-align: right;">
          <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        </div>
        <div class="report-container">
          <div class="header">
            <div class="logo">VShield</div>
            <div class="report-title">Background Verification Report</div>
          </div>
          
          <div class="section-title">Candidate Details</div>
          <div class="grid">
            <div class="field">
              <div class="label">Full Name</div>
              <div class="value">${reportData.candidateName}</div>
            </div>
            <div class="field">
              <div class="label">Email Address</div>
              <div class="value">${reportData.email}</div>
            </div>
            <div class="field">
              <div class="label">Phone Number</div>
              <div class="value">${reportData.phone}</div>
            </div>
            <div class="field">
              <div class="label">Date of Birth</div>
              <div class="value">${reportData.dob}</div>
            </div>
          </div>
          <div class="field" style="margin-bottom: 25px;">
            <div class="label">Residential Address</div>
            <div class="value">${reportData.address}</div>
          </div>

          <div class="section-title">Verification Results</div>
          <div class="grid">
            <div class="field">
              <div class="label">Aadhaar Status (${reportData.maskedAadhaar})</div>
              <div style="margin-top: 5px;">
                <span class="status-badge status-${reportData.aadhaarVerification}">
                  ${reportData.aadhaarVerification === 'SUCCESS' ? 'VERIFIED' : reportData.aadhaarVerification === 'FAILED' ? 'FAILED' : 'NOT STARTED'}
                </span>
              </div>
            </div>
            <div class="field">
              <div class="label">PAN Status (${reportData.maskedPan})</div>
              <div style="margin-top: 5px;">
                <span class="status-badge status-${reportData.panVerification}">
                  ${reportData.panVerification === 'SUCCESS' ? 'VERIFIED' : reportData.panVerification === 'FAILED' ? 'FAILED' : 'NOT STARTED'}
                </span>
              </div>
            </div>
          </div>

          <div class="field" style="margin-top: 20px; background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #ffc9c9; display: ${reportData.overallStatus === 'FAILED' ? 'block' : 'none'}">
            <div class="label" style="color: #e64949;">Audit Outcome Summary</div>
            <div class="value" style="color: #c92a2a; font-weight: 600;">The candidate has failed both Aadhaar and PAN verification audits. Background verification clearance is denied.</div>
          </div>

          <div class="field" style="margin-top: 20px; background: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fde68a; display: ${reportData.overallStatus === 'PARTIAL' ? 'block' : 'none'}">
            <div class="label" style="color: #ca8a04;">Audit Outcome Summary</div>
            <div class="value" style="color: #a16207; font-weight: 600;">The candidate has achieved partial clearance. One of the verified documents failed authentication. Additional check-ins required.</div>
          </div>

          <div class="field" style="margin-top: 20px; background: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #a7f3d0; display: ${reportData.overallStatus === 'VERIFIED' ? 'block' : 'none'}">
            <div class="label" style="color: #059669;">Audit Outcome Summary</div>
            <div class="value" style="color: #047857; font-weight: 600;">The candidate has successfully cleared identity audits for Aadhaar and PAN records. Background verification clearance is approved.</div>
          </div>

          <div class="section-title">Certification Log</div>
          <div class="grid">
            <div class="field">
              <div class="label">Overall Status</div>
              <div style="margin-top: 5px;">
                <span class="status-badge status-${reportData.overallStatus}">${reportData.overallStatus}</span>
              </div>
            </div>
            <div class="field">
              <div class="label">Report Generated On</div>
              <div class="value">${reportData.generatedOn}</div>
            </div>
          </div>

          <div class="signature-box">
            <div>
              <div class="label">Digital Fingerprint Auth Code</div>
              <div class="signature-fingerprint">${reportData.digitalSignature}</div>
            </div>
            <div class="signature-line">
              <div class="signature-line-mark"></div>
              <div class="label">Certified By: ${reportData.verifiedBy}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return res.status(200).send(htmlContent);
  } catch (error) {
    return next(error);
  }
};
