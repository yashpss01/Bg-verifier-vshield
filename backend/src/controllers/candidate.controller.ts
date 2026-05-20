import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/db';

export const createCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        email,
        phone,
        aadhaarNumber,
        panNumber,
        dob: new Date(dob),
        address,
        status: 'PENDING',
        createdById: userId,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Candidate profile created successfully.',
      data: candidate,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCandidates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { search, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    // Build Prisma query filters
    const whereClause: any = {
      createdById: userId,
    };

    if (status) {
      whereClause.status = status as string;
    }

    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { fullName: { contains: searchStr } },
        { email: { contains: searchStr } },
        { phone: { contains: searchStr } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      status: 'success',
      results: candidates.length,
      data: candidates,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

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
        message: 'Candidate not found.',
      });
    }

    const parsedLogs = candidate.verificationLogs.map((log) => {
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
      data: {
        ...candidate,
        verificationLogs: parsedLogs,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    // Verify candidate ownership
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found or unauthorized to update.',
      });
    }

    // Map properties for model update
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Candidate updated successfully.',
      data: updatedCandidate,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized. User context missing.',
      });
    }

    // Verify ownership
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!candidate) {
      return res.status(404).json({
        status: 'error',
        message: 'Candidate not found or unauthorized to delete.',
      });
    }

    await prisma.candidate.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Candidate deleted successfully.',
    });
  } catch (error) {
    return next(error);
  }
};
