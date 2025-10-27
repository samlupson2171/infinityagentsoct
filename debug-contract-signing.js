const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testContractSigning() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    // Import models
    const User = require('./src/models/User').default;
    const ContractTemplate = require('./src/models/ContractTemplate').default;
    const ContractSignature = require('./src/models/ContractSignature').default;

    // Find an approved user
    const user = await User.findOne({ registrationStatus: 'approved' });
    if (!user) {
      console.log('No approved user found');
      process.exit(1);
    }
    console.log('Found user:', user.name, user._id);

    // Find an active contract
    const contract = await ContractTemplate.findOne({ isActive: true });
    if (!contract) {
      console.log('No active contract found');
      process.exit(1);
    }
    console.log('Found contract:', contract.title, contract._id, 'version:', contract.version);

    // Try to create a signature
    console.log('\nAttempting to create signature...');
    const signature = new ContractSignature({
      userId: user._id,
      contractTemplateId: contract._id,
      signedAt: new Date(),
      signature: 'accepted',
      signatureType: 'checkbox',
      ipAddress: 'unknown',
      userAgent: 'test-agent',
    });

    console.log('Signature object created, attempting to save...');
    await signature.save();
    console.log('✓ Signature saved successfully!');
    console.log('Signature ID:', signature._id);

    // Clean up
    await ContractSignature.deleteOne({ _id: signature._id });
    console.log('✓ Test signature cleaned up');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

testContractSigning();
