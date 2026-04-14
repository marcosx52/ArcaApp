import { PrismaClient, CompanyRole, CustomerType, DocumentType, ItemType, ArcaEnvironment, ConfigStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin12345', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      fullName: 'Admin Demo',
    },
  });

  const company = await prisma.company.upsert({
    where: { cuit: '20111111112' },
    update: {},
    create: {
      legalName: 'Empresa Demo SA',
      tradeName: 'Demo Facturación',
      cuit: '20111111112',
      taxProfile: 'responsable_inscripto',
      vatCondition: 'iva_responsable_inscripto',
      email: 'admin@demo.com',
      onboardingStatus: 'PENDING_TAX_SETUP',
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: CompanyRole.OWNER,
      isDefault: true,
    },
  });

  await prisma.companyTaxConfig.create({
    data: {
      companyId: company.id,
      environment: ArcaEnvironment.TESTING,
      arcaServiceType: 'wsfev1',
      homologationEnabled: true,
      configStatus: ConfigStatus.INCOMPLETE,
      defaultCurrency: 'PES',
      defaultInvoiceTypeC: 'Factura C',
      defaultInvoiceTypeB: 'Factura B',
    },
  }).catch(() => undefined);

  await prisma.salesPoint.create({
    data: {
      companyId: company.id,
      posNumber: 3,
      name: 'Punto demo',
      enabledForTesting: true,
      status: 'ACTIVE',
    },
  }).catch(() => undefined);

  await prisma.customer.create({
    data: {
      companyId: company.id,
      customerType: CustomerType.FINAL_CONSUMER_PROFILE,
      legalName: 'Consumidor Final',
      documentType: DocumentType.DNI,
      documentNumber: '00000000',
      taxCondition: 'consumidor_final',
      isFrequent: true,
    },
  }).catch(() => undefined);

  await prisma.product.create({
    data: {
      companyId: company.id,
      itemType: ItemType.SERVICE,
      name: 'Servicio demo',
      description: 'Servicio base para pruebas del flujo de facturación',
      unitName: 'unidad',
      referencePrice: '120000',
      taxTreatment: 'GRAVADO',
      vatRate: '21',
    },
  }).catch(() => undefined);

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
