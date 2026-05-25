require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.auditLog.deleteMany();
  await prisma.analytics.deleteMany();
  await prisma.broadcast.deleteMany();
  await prisma.task.deleteMany();
  await prisma.aiInstruction.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.responder.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.user.deleteMany();
  console.log('Seeding rich database with Bengaluru disaster data...');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  // Users
  const adminUser = await prisma.user.create({
    data: { fullName: 'Bengaluru Command Center', email: 'admin@suraksha.gov.in', phoneNumber: '+919999999990', passwordHash, role: 'SUPER_ADMIN' },
  });

  // Agencies
  const ndrf = await prisma.agency.create({ data: { name: 'NDRF Battalion 10', type: 'RESCUE', contactEmail: 'ndrf10@suraksha.gov.in' } });
  const bbmp = await prisma.agency.create({ data: { name: 'BBMP Disaster Management', type: 'MUNICIPALITY', contactEmail: 'bbmp_dm@suraksha.gov.in' } });
  const fireDept = await prisma.agency.create({ data: { name: 'Karnataka Fire Services', type: 'FIRE', contactEmail: 'fire@suraksha.gov.in' } });
  const medical = await prisma.agency.create({ data: { name: 'Victoria Hospital Emergency', type: 'MEDICAL', contactEmail: 'med@suraksha.gov.in' } });

  // Responders
  const agencyIds = [ndrf.id, bbmp.id, fireDept.id, medical.id];
  for (let i = 1; i <= 12; i++) {
    const user = await prisma.user.create({
      data: { fullName: `Responder Officer ${i}`, email: `officer${i}@suraksha.gov.in`, phoneNumber: `+9199999999${i+10}`, passwordHash, role: 'RESPONDER' },
    });
    await prisma.responder.create({
      data: { userId: user.id, agencyId: agencyIds[i % 4], status: i % 3 === 0 ? 'DEPLOYED' : 'AVAILABLE', lat: 12.9716 + (Math.random() * 0.1 - 0.05), lng: 77.5946 + (Math.random() * 0.1 - 0.05) }
    });
  }

  // Volunteers & Citizen
  const citizenUser = await prisma.user.create({
    data: { fullName: 'Demo Citizen', email: 'citizen@gmail.com', phoneNumber: '+917777777777', passwordHash, role: 'VOLUNTEER' }
  });
  await prisma.volunteer.create({
    data: { userId: citizenUser.id, skills: ['GENERAL'], isAvailable: true, lat: 12.9716, lng: 77.5946 }
  });

  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: { fullName: `Local Volunteer ${i}`, email: `vol${i}@gmail.com`, phoneNumber: `+9188888888${i+10}`, passwordHash, role: 'VOLUNTEER' },
    });
    await prisma.volunteer.create({
      data: { userId: user.id, skills: i % 2 === 0 ? ['MEDICAL'] : ['RESCUE', 'LOGISTICS'], isAvailable: true, lat: 12.9716 + (Math.random() * 0.1 - 0.05), lng: 77.5946 + (Math.random() * 0.1 - 0.05) }
    });
  }

  // Incidents
  const incidents = [
    { title: 'Severe Waterlogging in Koramangala', description: 'Main 80ft road flooded.', type: 'Flood', severity: 'HIGH', status: 'ACTIVE', lat: 12.9279, lng: 77.6271, createdById: adminUser.id, aiConfidence: 0.95 },
    { title: 'Building Collapse near Majestic', description: 'Old commercial building collapsed.', type: 'Collapse', severity: 'CRITICAL', status: 'ACTIVE', lat: 12.9766, lng: 77.5713, createdById: adminUser.id, aiConfidence: 0.98 },
    { title: 'Tree Fallen on Power Lines', description: 'Banyan tree uprooted falling on BESCOM transformer.', type: 'Infrastructure', severity: 'MEDIUM', status: 'PENDING', lat: 12.9719, lng: 77.6412, createdById: adminUser.id, aiConfidence: 0.85 },
    { title: 'Fake Spam Report', description: 'Aliens landing in Cubbon Park, please send help!', type: 'Other', severity: 'LOW', status: 'PENDING', lat: 12.9769, lng: 77.5933, createdById: adminUser.id, aiConfidence: 0.12 },
    { title: 'Fire at Peenya Industrial Area', description: 'Chemical factory caught fire. Toxic fumes reported.', type: 'Fire', severity: 'CRITICAL', status: 'ACTIVE', lat: 13.0285, lng: 77.5197, createdById: adminUser.id, aiConfidence: 0.92 },
    { title: 'Traffic Jam - Not a disaster', description: 'Silk board is blocked as usual.', type: 'Other', severity: 'LOW', status: 'PENDING', lat: 12.9176, lng: 77.6234, createdById: adminUser.id, aiConfidence: 0.25 },
  ];
  const createdIncidents = [];
  for (const inc of incidents) {
    const created = await prisma.incident.create({ data: inc });
    createdIncidents.push(created);
  }

  // Broadcasts
  const broadcasts = [
    { title: 'Red Alert', body: 'Heavy rainfall expected in South Bengaluru. Stay indoors.', type: 'PUSH', recipientsCount: 45000, sentById: adminUser.id },
    { title: 'Evacuation Notice', body: 'Residents near Bellandur lake please evacuate to nearest shelter.', type: 'SMS', recipientsCount: 12000, sentById: adminUser.id },
    { title: 'Power Cut Warning', body: 'BESCOM has cut power in Indiranagar due to fallen trees.', type: 'WHATSAPP', recipientsCount: 8000, sentById: adminUser.id },
    { title: 'Safe Status', body: 'Majestic building collapse area secured. NDRF on site.', type: 'PUSH', recipientsCount: 500, sentById: adminUser.id },
    { title: 'Traffic Advisory', body: 'Avoid Outer Ring Road (ORR). Severe waterlogging.', type: 'PUSH', recipientsCount: 120000, sentById: adminUser.id },
  ];
  for (const b of broadcasts) {
    await prisma.broadcast.create({ data: b });
  }

  for (const incident of createdIncidents) {
    await prisma.task.create({
      data: {
        title: `Dispatch Rescue Team for ${incident.title}`,
        status: 'IN_PROGRESS',
        incidentId: incident.id,
        assigneeId: adminUser.id
      }
    });
  }

  // Seed Rescue Vehicles
  const vehicleTypes = ['Ambulance', 'Fire Truck', 'Rescue Boat', 'NDRF Transport'];
  const vehicles = [];
  for (let i = 1; i <= 12; i++) {
    const v = await prisma.rescueVehicle.create({
      data: {
        type: vehicleTypes[i % vehicleTypes.length],
        capacity: 4 + (i % 4) * 2,
        fuelLevel: 80.0 + (Math.random() * 20),
        lat: 12.9716 + (Math.random() * 0.1 - 0.05),
        lng: 77.5946 + (Math.random() * 0.1 - 0.05),
        status: i % 4 === 0 ? 'DEPLOYED' : 'AVAILABLE'
      }
    });
    vehicles.push(v);
  }

  // Analytics
  await prisma.analytics.create({
    data: { totalIncidents: 145, avgResponseTime: 8.5, resourcesUsed: 420 }
  });

  console.log("✅ Rich Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
