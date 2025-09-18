const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUser() {
  try {
    console.log('🔍 Checking for sub owner users...');
    
    // Find the user we just created
    const user = await prisma.user.findFirst({
      where: { username: 'SOW0002' },
      include: {
        userCommissionShare: true,
        parent: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    if (user) {
      console.log('✅ User found successfully!');
      console.log('📊 User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Contact: ${user.contactno}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Limit: ₹${user.limit.toLocaleString()}`);
      console.log(`   Reference: ${user.reference}`);
      console.log(`   Created: ${user.createdAt}`);
      
      if (user.userCommissionShare) {
        console.log('📈 Commission Details:');
        console.log(`   Main Share: ${user.userCommissionShare.share}%`);
        console.log(`   Casino Share: ${user.userCommissionShare.cshare}%`);
        console.log(`   Match Commission: ${user.userCommissionShare.matchcommission}%`);
        console.log(`   Session Commission: ${user.userCommissionShare.sessioncommission}%`);
        console.log(`   Casino Commission: ${user.userCommissionShare.casinocommission}%`);
      }
    } else {
      console.log('❌ User not found!');
    }

    // Also show all sub owner users
    console.log('\n📋 All SUB_OWN users:');
    const subOwners = await prisma.user.findMany({
      where: { role: 'SUB_OWN' },
      select: {
        username: true,
        name: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    subOwners.forEach((owner, index) => {
      console.log(`   ${index + 1}. ${owner.username} - ${owner.name} (${owner.status}) - ${owner.createdAt.toISOString().split('T')[0]}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
