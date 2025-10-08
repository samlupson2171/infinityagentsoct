// This script tests the destinations API endpoint
// You'll need to provide a valid session cookie or token

console.log('🧪 Testing Destinations API...\n');
console.log('⚠️  This test requires you to be logged in to the application.');
console.log('📝 Instructions:');
console.log('   1. Open your browser and log in to http://localhost:3002');
console.log('   2. Open DevTools (F12) and go to the Console tab');
console.log('   3. Run this command:\n');
console.log('   fetch("/api/admin/destinations?page=1&limit=10&sortField=lastModified&sortDirection=desc")');
console.log('     .then(r => r.json())');
console.log('     .then(data => console.log(data))');
console.log('     .catch(err => console.error(err));\n');
console.log('   4. Check the response in the console\n');
console.log('💡 Common issues:');
console.log('   - 401 Unauthorized: You\'re not logged in');
console.log('   - 403 Forbidden: Your user doesn\'t have admin role');
console.log('   - 500 Server Error: Check the server logs');
console.log('   - Empty array: The query might be filtering out results\n');
console.log('🔍 To check your session:');
console.log('   Run this in the browser console:');
console.log('   fetch("/api/auth/session").then(r => r.json()).then(console.log)\n');
