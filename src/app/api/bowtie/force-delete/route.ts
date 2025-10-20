import { NextResponse } from 'next/server';
import { TableClient } from '@azure/data-tables';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const bowtieTableName = 'bowties';

export async function POST(request: Request) {
  try {
    const { riskId } = await request.json();
    
    if (!riskId) {
      return NextResponse.json({ error: 'riskId is required' }, { status: 400 });
    }

    console.log('🔥 FORCE DELETE - Starting for riskId:', riskId);
    
    const client = TableClient.fromConnectionString(connectionString, bowtieTableName);
    
    // Listar TODAS as entidades da tabela
    const allEntities = client.listEntities();
    let totalEntities = 0;
    let matchingEntities = 0;
    let deletedCount = 0;
    const deletedItems: any[] = [];

    console.log('📋 Scanning entire table...');
    
    for await (const entity of allEntities) {
      totalEntities++;
      console.log(`   Entity ${totalEntities}: PK="${entity.partitionKey}", RK="${entity.rowKey}"`);
      
      // Deletar se o PartitionKey for o riskId
      if (entity.partitionKey === riskId) {
        matchingEntities++;
        console.log(`   ✅ MATCH! Deleting PK="${entity.partitionKey}", RK="${entity.rowKey}"`);
        
        try {
          await client.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
          deletedCount++;
          deletedItems.push({
            partitionKey: entity.partitionKey,
            rowKey: entity.rowKey
          });
          console.log(`   ✅ DELETED`);
        } catch (deleteError) {
          console.error(`   ❌ Failed to delete:`, deleteError);
        }
      }
    }

    console.log('📊 FORCE DELETE Summary:');
    console.log(`   Total entities in table: ${totalEntities}`);
    console.log(`   Matching entities: ${matchingEntities}`);
    console.log(`   Successfully deleted: ${deletedCount}`);

    return NextResponse.json({
      message: 'Force delete completed',
      riskId,
      totalEntities,
      matchingEntities,
      deletedCount,
      deletedItems
    });

  } catch (error) {
    console.error('❌ Force delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to force delete',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
