-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED_FUTURE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CompanyOnboardingStatus" AS ENUM ('DRAFT', 'PENDING_TAX_SETUP', 'READY_FOR_HOMOLOGATION', 'READY_FOR_PRODUCTION', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ArcaEnvironment" AS ENUM ('TESTING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ConfigStatus" AS ENUM ('INCOMPLETE', 'PENDING_VALIDATION', 'VALIDATED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('UPLOADED', 'VALID', 'EXPIRED', 'INVALID', 'REVOKED');

-- CreateEnum
CREATE TYPE "SalesPointStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY', 'FINAL_CONSUMER_PROFILE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CUIT', 'CUIL', 'DNI', 'SIN_DOCUMENTO');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "TaxTreatment" AS ENUM ('GRAVADO', 'EXENTO', 'NO_ALCANZADO');

-- CreateEnum
CREATE TYPE "InvoiceKind" AS ENUM ('INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE_FUTURE');

-- CreateEnum
CREATE TYPE "InvoiceLetter" AS ENUM ('A', 'B', 'C', 'M', 'E_FUTURE');

-- CreateEnum
CREATE TYPE "ConceptType" AS ENUM ('PRODUCTS', 'SERVICES', 'PRODUCTS_AND_SERVICES');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'READY', 'SENDING', 'ISSUED', 'FAILED', 'CANCELLED_LOGICALLY');

-- CreateEnum
CREATE TYPE "ArcaInvoiceStatus" AS ENUM ('NOT_SENT', 'ACCEPTED', 'REJECTED', 'PARTIAL_WARNING', 'UNKNOWN_NEEDS_CHECK');

-- CreateEnum
CREATE TYPE "InvoiceEventType" AS ENUM ('DRAFT_CREATED', 'DRAFT_UPDATED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'EMISSION_REQUESTED', 'EMISSION_SENT', 'EMISSION_ACCEPTED', 'EMISSION_REJECTED', 'PDF_GENERATED', 'MANUALLY_MARKED_FOR_REVIEW');

-- CreateEnum
CREATE TYPE "InvoiceRelationType" AS ENUM ('CREDITS', 'DEBITS_FUTURE', 'REFERENCES');

-- CreateEnum
CREATE TYPE "ArcaAuthSessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'INVALID', 'REVOKED');

-- CreateEnum
CREATE TYPE "ArcaRequestType" AS ENUM ('WSAA_LOGIN', 'INVOICE_EMIT', 'INVOICE_CONSULT', 'VOUCHER_LAST_NUMBER_CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationResult" AS ENUM ('SUCCESS', 'REJECTED', 'TIMEOUT', 'TRANSPORT_ERROR', 'PARSING_ERROR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "GeneratedDocumentType" AS ENUM ('PDF_INVOICE', 'QR_IMAGE_FUTURE', 'TECHNICAL_REPORT_FUTURE');

-- CreateEnum
CREATE TYPE "DocumentGenerationStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "cuit" TEXT NOT NULL,
    "taxProfile" TEXT NOT NULL,
    "vatCondition" TEXT NOT NULL,
    "addressLine" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT DEFAULT 'AR',
    "email" TEXT,
    "phone" TEXT,
    "onboardingStatus" "CompanyOnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'OWNER',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyTaxConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "environment" "ArcaEnvironment" NOT NULL,
    "arcaServiceType" TEXT,
    "productionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "homologationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "nextInvoiceFlowMode" TEXT,
    "defaultCurrency" TEXT DEFAULT 'PES',
    "defaultInvoiceTypeC" TEXT,
    "defaultInvoiceTypeB" TEXT,
    "configStatus" "ConfigStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyTaxConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCertificate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "environment" "ArcaEnvironment" NOT NULL,
    "certificateAlias" TEXT,
    "certificateStorageKey" TEXT NOT NULL,
    "privateKeyStorageKey" TEXT NOT NULL,
    "certificateStatus" "CertificateStatus" NOT NULL DEFAULT 'UPLOADED',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "lastTestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPoint" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "posNumber" INTEGER NOT NULL,
    "name" TEXT,
    "arcaPosType" TEXT,
    "enabledForTesting" BOOLEAN NOT NULL DEFAULT false,
    "enabledForProduction" BOOLEAN NOT NULL DEFAULT false,
    "status" "SalesPointStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "legalName" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "taxCondition" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "province" TEXT,
    "notes" TEXT,
    "isFrequent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unitName" TEXT,
    "referencePrice" DECIMAL(18,2),
    "taxTreatment" "TaxTreatment",
    "vatRate" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "salesPointId" TEXT,
    "customerId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "invoiceKind" "InvoiceKind" NOT NULL,
    "invoiceLetter" "InvoiceLetter" NOT NULL,
    "invoiceNumber" INTEGER,
    "fullInvoiceCode" TEXT,
    "conceptType" "ConceptType",
    "currencyCode" TEXT DEFAULT 'PES',
    "currencyRate" DECIMAL(18,6),
    "issueDate" TIMESTAMP(3),
    "serviceFromDate" TIMESTAMP(3),
    "serviceToDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "subtotalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "otherTaxesAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "arcaStatus" "ArcaInvoiceStatus" NOT NULL DEFAULT 'NOT_SENT',
    "cae" TEXT,
    "caeDueDate" TIMESTAMP(3),
    "arcaResultCode" TEXT,
    "arcaObservationsSummary" TEXT,
    "pdfDocumentId" TEXT,
    "emittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "lineOrder" INTEGER NOT NULL,
    "itemCode" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "subtotalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2),
    "vatAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceEvent" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "eventType" "InvoiceEventType" NOT NULL,
    "previousStatus" "InvoiceStatus",
    "newStatus" "InvoiceStatus",
    "message" TEXT,
    "payloadSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRelation" (
    "id" TEXT NOT NULL,
    "sourceInvoiceId" TEXT NOT NULL,
    "targetInvoiceId" TEXT NOT NULL,
    "relationType" "InvoiceRelationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArcaAuthSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "environment" "ArcaEnvironment" NOT NULL,
    "serviceName" TEXT NOT NULL,
    "tokenValue" TEXT,
    "signValue" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "ArcaAuthSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcaAuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArcaRequestLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "requestType" "ArcaRequestType" NOT NULL,
    "environment" "ArcaEnvironment" NOT NULL,
    "endpointName" TEXT,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "httpStatus" INTEGER,
    "integrationResult" "IntegrationResult" NOT NULL DEFAULT 'UNKNOWN',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ArcaRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "documentType" "GeneratedDocumentType" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "generationStatus" "DocumentGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cuit_key" ON "Company"("cuit");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_idx" ON "UserCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyTaxConfig_companyId_environment_idx" ON "CompanyTaxConfig"("companyId", "environment");

-- CreateIndex
CREATE INDEX "CompanyCertificate_companyId_environment_idx" ON "CompanyCertificate"("companyId", "environment");

-- CreateIndex
CREATE INDEX "SalesPoint_companyId_status_idx" ON "SalesPoint"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SalesPoint_companyId_posNumber_key" ON "SalesPoint"("companyId", "posNumber");

-- CreateIndex
CREATE INDEX "Customer_companyId_legalName_idx" ON "Customer"("companyId", "legalName");

-- CreateIndex
CREATE INDEX "Customer_companyId_documentNumber_idx" ON "Customer"("companyId", "documentNumber");

-- CreateIndex
CREATE INDEX "Customer_companyId_isActive_idx" ON "Customer"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "Product_companyId_name_idx" ON "Product"("companyId", "name");

-- CreateIndex
CREATE INDEX "Product_companyId_isActive_idx" ON "Product"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_idx" ON "Invoice"("companyId", "status");

-- CreateIndex
CREATE INDEX "Invoice_companyId_issueDate_idx" ON "Invoice"("companyId", "issueDate");

-- CreateIndex
CREATE INDEX "Invoice_companyId_invoiceNumber_idx" ON "Invoice"("companyId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_companyId_customerId_idx" ON "Invoice"("companyId", "customerId");

-- CreateIndex
CREATE INDEX "Invoice_companyId_arcaStatus_idx" ON "Invoice"("companyId", "arcaStatus");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_lineOrder_idx" ON "InvoiceItem"("invoiceId", "lineOrder");

-- CreateIndex
CREATE INDEX "InvoiceEvent_invoiceId_createdAt_idx" ON "InvoiceEvent"("invoiceId", "createdAt");

-- CreateIndex
CREATE INDEX "InvoiceEvent_companyId_createdAt_idx" ON "InvoiceEvent"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "InvoiceRelation_sourceInvoiceId_idx" ON "InvoiceRelation"("sourceInvoiceId");

-- CreateIndex
CREATE INDEX "InvoiceRelation_targetInvoiceId_idx" ON "InvoiceRelation"("targetInvoiceId");

-- CreateIndex
CREATE INDEX "ArcaAuthSession_companyId_environment_serviceName_idx" ON "ArcaAuthSession"("companyId", "environment", "serviceName");

-- CreateIndex
CREATE INDEX "ArcaAuthSession_expiresAt_idx" ON "ArcaAuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "ArcaRequestLog_companyId_requestedAt_idx" ON "ArcaRequestLog"("companyId", "requestedAt");

-- CreateIndex
CREATE INDEX "ArcaRequestLog_invoiceId_requestedAt_idx" ON "ArcaRequestLog"("invoiceId", "requestedAt");

-- CreateIndex
CREATE INDEX "GeneratedDocument_companyId_documentType_idx" ON "GeneratedDocument"("companyId", "documentType");

-- CreateIndex
CREATE INDEX "GeneratedDocument_invoiceId_idx" ON "GeneratedDocument"("invoiceId");

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyTaxConfig" ADD CONSTRAINT "CompanyTaxConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCertificate" ADD CONSTRAINT "CompanyCertificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesPoint" ADD CONSTRAINT "SalesPoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_salesPointId_fkey" FOREIGN KEY ("salesPointId") REFERENCES "SalesPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_pdfDocumentId_fkey" FOREIGN KEY ("pdfDocumentId") REFERENCES "GeneratedDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceEvent" ADD CONSTRAINT "InvoiceEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceEvent" ADD CONSTRAINT "InvoiceEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceEvent" ADD CONSTRAINT "InvoiceEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRelation" ADD CONSTRAINT "InvoiceRelation_sourceInvoiceId_fkey" FOREIGN KEY ("sourceInvoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRelation" ADD CONSTRAINT "InvoiceRelation_targetInvoiceId_fkey" FOREIGN KEY ("targetInvoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcaAuthSession" ADD CONSTRAINT "ArcaAuthSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcaRequestLog" ADD CONSTRAINT "ArcaRequestLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcaRequestLog" ADD CONSTRAINT "ArcaRequestLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
