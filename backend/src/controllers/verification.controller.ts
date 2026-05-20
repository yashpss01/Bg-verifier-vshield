import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/db';
import axios from 'axios';

const PORT = process.env.PORT || 5000;

// Internal Mock Aadhaar Verification Server API
export const mockVerifyAadhaar = async (req: Request, res: Response) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid Aadhaar number format. Must be 12 numeric digits.',
    });
  }

  // Allow mocking failure if Aadhaar starts with '9999'
  if (aadhaarNumber.startsWith('9999')) {
    return res.status(200).json({
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      message: 'Aadhaar details could not be matched with registry data.',
    });
  }

  return res.status(200).json({
    status: 'verified',
    nameMatch: true,
    dobMatch: true,
    message: 'Aadhaar verified successfully',
  });
};

// Internal Mock PAN Verification Server API
export const mockVerifyPAN = async (req: Request, res: Response) => {
  const { panNumber } = req.body;

  if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid PAN number format. Must match ABCDE1234F format.',
    });
  }

  // Allow mocking failure if PAN starts with 'PANFA'
  if (panNumber.startsWith('PANFA')) {
    return res.status(200).json({
      status: 'failed',
      panStatus: 'inactive',
      message: 'PAN number is flagged as inactive or invalid.',
    });
  }

  return res.status(200).json({
    status: 'verified',
    panStatus: 'active',
    message: 'PAN verified successfully',
  });
};

// Client Orchestrator
export const startVerification = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    // Fetch candidate
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate profile not found.',
      });
    }

    let aadhaarResult;
    let panResult;

    const mockAadhaarUrl = `http://localhost:${PORT}/mock-api/aadhaar/verify`;
    const mockPanUrl = `http://localhost:${PORT}/mock-api/pan/verify`;

    // 1. Call Aadhaar Mock API
    try {
      const response = await axios.post(mockAadhaarUrl, {
        aadhaarNumber: candidate.aadhaarNumber,
      });
      aadhaarResult = response.data;
    } catch (err: any) {
      aadhaarResult = {
        status: 'failed',
        message: err.response?.data?.message || 'Aadhaar network timeout error.',
      };
    }

    // 2. Call PAN Mock API
    try {
      const response = await axios.post(mockPanUrl, {
        panNumber: candidate.panNumber,
      });
      panResult = response.data;
    } catch (err: any) {
      panResult = {
        status: 'failed',
        message: err.response?.data?.message || 'PAN network timeout error.',
      };
    }

    // 3. Save Aadhaar Verification Log in DB
    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'AADHAAR',
        requestPayload: JSON.stringify({ aadhaarNumber: candidate.aadhaarNumber }),
        responsePayload: JSON.stringify(aadhaarResult),
        verificationStatus: aadhaarResult.status === 'verified' ? 'SUCCESS' : 'FAILED',
      },
    });

    // 4. Save PAN Verification Log in DB
    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'PAN',
        requestPayload: JSON.stringify({ panNumber: candidate.panNumber }),
        responsePayload: JSON.stringify(panResult),
        verificationStatus: panResult.status === 'verified' ? 'SUCCESS' : 'FAILED',
      },
    });

    // 5. Determine Overall Status
    let overallStatus = 'FAILED';
    if (aadhaarResult.status === 'verified' && panResult.status === 'verified') {
      overallStatus = 'VERIFIED';
    } else if (aadhaarResult.status === 'verified' || panResult.status === 'verified') {
      overallStatus = 'PARTIAL';
    }

    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: overallStatus },
      include: {
        verificationLogs: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
    });

    const parsedLogs = updatedCandidate.verificationLogs.map((log) => {
      let requestPayload = log.requestPayload;
      let responsePayload = log.responsePayload;
      
      try {
        if (typeof requestPayload === 'string') {
          requestPayload = JSON.parse(requestPayload);
        }
        if (typeof responsePayload === 'string') {
          responsePayload = JSON.parse(responsePayload);
        }
      } catch (err) {}

      return {
        ...log,
        requestPayload,
        responsePayload,
      };
    });

    return res.status(200).json({
      status: 'success',
      message: `Verification complete. Final Candidate status: ${overallStatus}.`,
      data: {
        ...updatedCandidate,
        verificationLogs: parsedLogs,
      },
    });
  } catch (error) {
    return next(error);
  }
};
