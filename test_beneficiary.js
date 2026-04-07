const beneficiaryData = require('./backend/data/beneficiary');
const { v4: uuidv4 } = require('uuid');

async function test() {
  try {
    const userId = 'akinboroo@gmail.com';
    const data = {
      name: 'Test Auto Save',
      email: 'auto@save.test',
      phone: '08012345678',
      accountName: 'Test Account',
      accountNumber: '1234567890',
      bankName: 'Test Bank'
    };
    
    console.log('Testing beneficiary creation...');
    const result = await beneficiaryData.create(userId, data);
    console.log('Success!', result);
  } catch (error) {
    console.error('Failed!', error);
  }
}

test();
