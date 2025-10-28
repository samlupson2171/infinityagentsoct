// Quick script to verify SMTP environment variables are set
// Run this locally to see what's configured

console.log('=== SMTP Environment Variables Check ===\n');

const requiredVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

const optionalVars = [
  'SMTP_SECURE',
  'EMAIL_FROM_NAME',
  'EMAIL_FROM_ADDRESS'
];

console.log('Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive data
    const displayValue = varName.includes('PASS') 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n=== Summary ===');
const allSet = requiredVars.every(v => process.env[v]);
if (allSet) {
  console.log('✅ All required SMTP variables are configured!');
} else {
  console.log('❌ Some required SMTP variables are missing!');
  console.log('\nMake sure these are set in Vercel:');
  console.log('1. Go to your Vercel project dashboard');
  console.log('2. Settings → Environment Variables');
  console.log('3. Add the missing variables');
  console.log('4. IMPORTANT: Redeploy your application after adding variables!');
}
