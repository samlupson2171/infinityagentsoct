/**
 * Verify SMTP Password Encoding
 * Check if there are any special characters causing issues
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verifying SMTP Password Configuration\n');

const password = process.env.SMTP_PASS;

if (!password) {
  console.error('❌ SMTP_PASS is not set in .env.local');
  process.exit(1);
}

console.log('Password Analysis:');
console.log(`  Length: ${password.length} characters`);
console.log(`  First char: ${password[0]}`);
console.log(`  Last char: ${password[password.length - 1]}`);
console.log(`  Contains spaces: ${password.includes(' ') ? 'YES ⚠️' : 'NO ✅'}`);
console.log(`  Contains quotes: ${password.includes('"') || password.includes("'") ? 'YES ⚠️' : 'NO ✅'}`);
console.log(`  Contains special chars: ${/[!@#$%^&*()]/.test(password) ? 'YES' : 'NO'}`);

console.log('\nSpecial Characters Found:');
const specialChars = password.match(/[^a-zA-Z0-9]/g);
if (specialChars) {
  console.log(`  ${specialChars.join(', ')}`);
} else {
  console.log('  None');
}

console.log('\nPassword (masked):');
console.log(`  ${password.substring(0, 2)}${'*'.repeat(password.length - 4)}${password.substring(password.length - 2)}`);

console.log('\nPassword (full - for verification):');
console.log(`  ${password}`);

console.log('\n📋 Recommendations:');
if (password.includes(' ')) {
  console.log('  ⚠️  Password contains spaces - this might cause issues');
}
if (password.includes('"') || password.includes("'")) {
  console.log('  ⚠️  Password contains quotes - remove quotes from .env.local');
}
if (password.length < 8) {
  console.log('  ⚠️  Password seems short - verify it\'s complete');
}

console.log('\n✅ Next Steps:');
console.log('  1. Verify this password matches your GoDaddy account');
console.log('  2. Try logging into https://email.secureserver.net/ with this password');
console.log('  3. If webmail login fails, the password is incorrect');
console.log('  4. If webmail works but SMTP fails, SMTP access needs to be enabled');
