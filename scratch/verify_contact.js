const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { handleContactForm } = require('../backend/src/controllers/contactController');

async function testContact() {
  console.log('🏁 Verifying contact form submission...');
  
  // Mock request and response
  const req = {
    body: {
      name: 'Verification Bot',
      email: 'bot@gsttaxwale.com',
      phone: '9999999999',
      message: 'Hello, this is a test support inquiry to verify prisma ticket creation.'
    }
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`   Response Received [Status ${this.statusCode}]:`, JSON.stringify(data));
      if (this.statusCode === 200 && data.success) {
        console.log('   ✅ Success: Contact form ticket created successfully!');
      } else {
        console.error('   ❌ Failed: Status code or response mismatch');
      }
    }
  };

  try {
    await handleContactForm(req, res);
  } catch (error) {
    console.error('❌ Execution Error:', error);
  } finally {
    // Cleanup the verification ticket from database
    const prisma = require('../backend/src/utils/prisma');
    try {
      const deleted = await prisma.supportTicket.deleteMany({
        where: {
          subject: 'Contact Form: Verification Bot'
        }
      });
      console.log(`🧹 Cleaned up ${deleted.count} verification ticket(s).`);
    } catch (cleanupErr) {
      console.error('⚠️ Cleanup error:', cleanupErr);
    }
    process.exit(0);
  }
}

testContact();
