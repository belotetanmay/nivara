import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { VendorStatus, KYCStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenCookie.value);
    if (!payload || payload.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      // 1. Personal KYC
      kycDocType,
      kycDocNumber,
      kycDocUrl,

      // 2. Business Validation
      businessName,
      bio,
      businessRegistrationNo,
      businessLicenseNo,
      gstNumber,
      panNumber,
      bankName,
      bankAccountNumber,
      bankIfsc,
      driverName,
      driverLicenseNo,
      driverKycUrl,

      // 3. Vehicle Details
      vehicleNumber,
      chassisNumber,
      insuranceUrl,
      pucUrl,
      rcUrl,
      isCommercial,

      // 4. Photos & Inspection
      vanTitle,
      vanDescription,
      vanAmenities,
      vanPrice15,
      vanPrice30,
      vanPrice45,
      vanPhotos,
      onSiteInspectionCertUrl,
      fakePhotoDeclaration,
      vanAddress
    } = body;

    // Validate presence of key documents and fields
    if (!kycDocUrl || !businessLicenseNo || !rcUrl || !insuranceUrl || !pucUrl || !onSiteInspectionCertUrl || !fakePhotoDeclaration) {
      return NextResponse.json({ 
        error: 'Missing required validation files. Personal ID, Business License, RC, Insurance, PUC, and On-Site Inspection certificates are mandatory.' 
      }, { status: 400 });
    }

    if (!businessName || !bankAccountNumber || !bankIfsc || !vehicleNumber || !chassisNumber || !vanTitle || !vanDescription) {
      return NextResponse.json({ 
        error: 'Missing business or vehicle parameter details.' 
      }, { status: 400 });
    }

    // Run transaction to save all onboarding details
    await db.$transaction(async (tx) => {
      // 1. Log personal KYC
      await tx.kYCDocument.create({
        data: {
          userId: payload.userId,
          docType: kycDocType || 'ID_CARD',
          docNumber: kycDocNumber || ('KYC-' + Math.random().toString(36).substring(2, 6).toUpperCase()),
          fileUrl: kycDocUrl,
          status: KYCStatus.PENDING,
        },
      });

      // 2. Update User KYC status to PENDING
      await tx.user.update({
        where: { id: payload.userId },
        data: {
          kycStatus: KYCStatus.PENDING,
        },
      });

      // 3. Upsert Vendor Profile with Business details
      const profile = await tx.vendorProfile.upsert({
        where: { userId: payload.userId },
        create: {
          userId: payload.userId,
          businessName,
          bio: bio || '',
          payoutDetails: JSON.stringify({ bankName, bankAccountNumber, bankIfsc }),
          verificationStatus: VendorStatus.PENDING,
          rejectionReason: null,
          businessRegistrationNo,
          businessLicenseNo,
          gstNumber,
          panNumber,
          bankName,
          bankAccountNumber,
          bankIfsc,
          driverName,
          driverLicenseNo,
          driverKycUrl,
        },
        update: {
          businessName,
          bio: bio || '',
          payoutDetails: JSON.stringify({ bankName, bankAccountNumber, bankIfsc }),
          verificationStatus: VendorStatus.PENDING,
          rejectionReason: null,
          businessRegistrationNo,
          businessLicenseNo,
          gstNumber,
          panNumber,
          bankName,
          bankAccountNumber,
          bankIfsc,
          driverName,
          driverLicenseNo,
          driverKycUrl,
        }
      });

      // 4. Create the First Van with all details
      await tx.van.create({
        data: {
          vendorId: profile.id,
          title: vanTitle,
          description: vanDescription,
          address: vanAddress || 'Mumbai, Maharashtra',
          latitude: 19.076, // Default fallback coordinates
          longitude: 72.877,
          serviceRadius: 15.0,
          price15: Number(vanPrice15) || 199,
          price30: Number(vanPrice30) || 399,
          price45: Number(vanPrice45) || 599,
          amenities: vanAmenities || ['Aromatherapy', 'Zero Gravity Chair', 'Soundproofing'],
          photos: vanPhotos || ['/van_demo.jpg'],
          status: 'UNDER_REVIEW',
          vehicleNumber,
          chassisNumber,
          insuranceUrl,
          pucUrl,
          rcUrl,
          isCommercial: !!isCommercial,
          onSiteInspectionCertUrl,
          fakePhotoDeclaration: !!fakePhotoDeclaration,
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Multi-step partner profile and vehicle registration submitted for vetting.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
