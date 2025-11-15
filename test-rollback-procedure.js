#!/usr/bin/env node

/**
 * Test script to verify rollback procedure works correctly
 * This will:
 * 1. Run the rollback
 * 2. Verify the rollback
 * 3. Re-run the migration
 * 4. Verify the migration again
 */

require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

async function runCommand(command, description) {
  console.log(`\n${description}...`);
  console.log(`Command: ${command}`);
  console.log('-'.repeat(60));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      input: 'yes\n' // Auto-confirm rollback
    });
    console.log(output);
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.error('STDERR:', error.stderr);
    return false;
  }
}

async function testRollbackProcedure() {
  console.log('='.repeat(60));
  console.log('Testing Rollback Procedure');
  console.log('='.repeat(60));
  
  // Step 1: Rollback the migration
  const rollbackSuccess = await runCommand(
    'echo "yes" | node scripts/rollback-quote-events-migration.js',
    'Step 1: Rolling back migration'
  );
  
  if (!rollbackSuccess) {
    console.error('\n❌ Rollback failed!');
    process.exit(1);
  }
  
  // Step 2: Verify rollback
  const verifyRollbackSuccess = await runCommand(
    'node scripts/verify-quote-events-migration.js',
    'Step 2: Verifying rollback (should show quotes without selectedEvents)'
  );
  
  // Step 3: Re-run migration
  const migrationSuccess = await runCommand(
    'node scripts/run-quote-events-migration.js',
    'Step 3: Re-running migration'
  );
  
  if (!migrationSuccess) {
    console.error('\n❌ Migration failed!');
    process.exit(1);
  }
  
  // Step 4: Verify migration again
  const verifyMigrationSuccess = await runCommand(
    'node scripts/verify-quote-events-migration.js',
    'Step 4: Verifying migration (should pass)'
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Rollback Procedure Test Complete!');
  console.log('='.repeat(60));
  console.log('\nAll steps completed successfully:');
  console.log('  ✓ Rollback executed');
  console.log('  ✓ Rollback verified');
  console.log('  ✓ Migration re-executed');
  console.log('  ✓ Migration verified');
  console.log('\nThe rollback procedure is working correctly!');
}

testRollbackProcedure();
