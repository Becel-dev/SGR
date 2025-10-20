// Script para forçar exclusão de bowtie corrompido
require('dotenv').config({ path: '.env.local' });
const { TableClient } = require('@azure/data-tables');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const bowtieTableName = 'bowties';
const riskIdToDelete = '7cf6ae06-6c04-4e9e-b5c3-dbc1f96b2172';

async function forceDelete() {
  console.log('🔥 FORCE DELETE - Starting...');
  console.log('🎯 Target riskId:', riskIdToDelete);
  console.log('🔌 Connection:', connectionString ? '✅ OK' : '❌ NOT FOUND');
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found in .env.local');
    process.exit(1);
  }

  const client = TableClient.fromConnectionString(connectionString, bowtieTableName);
  
  // Listar TODAS as entidades da tabela
  const allEntities = client.listEntities();
  let totalEntities = 0;
  let matchingEntities = 0;
  let deletedCount = 0;
  const deletedItems = [];

  console.log('📋 Scanning entire table...\n');
  
  for await (const entity of allEntities) {
    totalEntities++;
    const pk = entity.partitionKey;
    const rk = entity.rowKey;
    
    console.log(`   Entity ${totalEntities}: PK="${pk}", RK="${rk}"`);
    
    // Deletar se o PartitionKey for o riskId OU se o RowKey contiver o id do bowtie
    if (pk === riskIdToDelete || rk.includes('17597587800625n0xw7s')) {
      matchingEntities++;
      console.log(`   ✅ MATCH! Will delete PK="${pk}", RK="${rk}"`);
      
      try {
        await client.deleteEntity(pk, rk);
        deletedCount++;
        deletedItems.push({ partitionKey: pk, rowKey: rk });
        console.log(`   ✅ DELETED\n`);
      } catch (deleteError) {
        console.error(`   ❌ Failed to delete:`, deleteError.message);
      }
    }
  }

  console.log('\n📊 FORCE DELETE Summary:');
  console.log(`   Total entities in table: ${totalEntities}`);
  console.log(`   Matching entities: ${matchingEntities}`);
  console.log(`   Successfully deleted: ${deletedCount}`);
  
  if (deletedItems.length > 0) {
    console.log('\n🗑️  Deleted items:');
    deletedItems.forEach((item, i) => {
      console.log(`   ${i + 1}. PK="${item.partitionKey}", RK="${item.rowKey}"`);
    });
  }
  
  console.log('\n✅ Done!');
}

forceDelete().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
