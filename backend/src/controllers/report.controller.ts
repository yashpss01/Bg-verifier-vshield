import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/db';

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
          .status-VERIFIED { background-color: #d1fae5; color: #065f46; }
          .status-FAILED { background-color: #fee2e2; color: #991b1b; }
          .status-PARTIAL { background-color: #fef3c7; color: #92400e; }
          .status-PENDING { background-color: #e0f2fe; color: #075985; }
          
          .status-SUCCESS { background-color: #d1fae5; color: #065f46; }
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

          <div class="field" style="margin-top: 20px; background: #fdf2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; display: ${reportData.overallStatus === 'FAILED' ? 'block' : 'none'}">
            <div class="label" style="color: #991b1b;">Audit Outcome Summary</div>
            <div class="value" style="color: #7f1d1d; font-weight: 600;">The candidate has failed both Aadhaar and PAN verification audits. Background verification clearance is denied.</div>
          </div>

          <div class="field" style="margin-top: 20px; background: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fde68a; display: ${reportData.overallStatus === 'PARTIAL' ? 'block' : 'none'}">
            <div class="label" style="color: #92400e;">Audit Outcome Summary</div>
            <div class="value" style="color: #78350f; font-weight: 600;">The candidate has achieved partial clearance. One of the verified documents failed authentication. Additional check-ins required.</div>
          </div>

          <div class="field" style="margin-top: 20px; background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; display: ${reportData.overallStatus === 'VERIFIED' ? 'block' : 'none'}">
            <div class="label" style="color: #166534;">Audit Outcome Summary</div>
            <div class="value" style="color: #14532d; font-weight: 600;">The candidate has successfully cleared identity audits for Aadhaar and PAN records. Background verification clearance is approved.</div>
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
