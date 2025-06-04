'use server';

import { redis } from '@/lib/redis';
import { getAllSubdomains, getSubdomainData } from '@/lib/subdomains';

// Master admin function to delete any subdomain (bypasses normal authorization)
export async function masterDeleteSubdomain(subdomain: string): Promise<boolean> {
  try {
    const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    await redis.del(`subdomain:${sanitizedSubdomain}`);
    return true;
  } catch (error) {
    console.error('Master delete error:', error);
    return false;
  }
}

// Get all subdomains for master admin
export async function getAllSubdomainsAction() {
  try {
    const subdomains = await getAllSubdomains();
    return {
      success: true,
      subdomains: subdomains.map(s => ({
        ...s,
        lastModified: s.createdAt // Use createdAt as fallback
      }))
    };
  } catch (error) {
    console.error('Error loading all subdomains:', error);
    return {
      success: false,
      subdomains: []
    };
  }
}

// Get stats for master admin
export async function getAdminStatsAction() {
  try {
    const subdomains = await getAllSubdomains();
    const uniqueUsers = new Set(subdomains.map(s => s.createdBy)).size;
    
    return {
      success: true,
      stats: {
        totalSubdomains: subdomains.length,
        totalUsers: uniqueUsers,
      }
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return {
      success: false,
      stats: {
        totalSubdomains: 0,
        totalUsers: 0,
      }
    };
  }
}

// Backup all subdomains data
export async function backupSubdomainsAction() {
  try {
    const subdomainsList = await getAllSubdomains();
    
    // Get full data for each subdomain including content
    const fullBackupData = await Promise.all(
      subdomainsList.map(async (subdomain) => {
        const fullData = await getSubdomainData(subdomain.subdomain);
        return {
          subdomain: subdomain.subdomain,
          fullData: fullData,
          basicInfo: subdomain
        };
      })
    );

    const backup = {
      exportDate: new Date().toISOString(),
      totalSubdomains: subdomainsList.length,
      subdomains: fullBackupData.filter(item => item.fullData !== null)
    };

    return {
      success: true,
      backup: backup
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    return {
      success: false,
      backup: null
    };
  }
}

// Restore subdomains from backup JSON
export async function restoreFromBackupAction(backupJson: string) {
  try {
    // Parse the backup JSON
    const backup = JSON.parse(backupJson);
    
    if (!backup.subdomains || !Array.isArray(backup.subdomains)) {
      return {
        success: false,
        error: 'Invalid backup format - missing subdomains array',
        stats: { processed: 0, restored: 0, skipped: 0 }
      };
    }

    let processed = 0;
    let restored = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each subdomain in the backup
    for (const item of backup.subdomains) {
      processed++;
      
      if (!item.fullData || !item.subdomain) {
        errors.push(`Invalid data for subdomain at index ${processed - 1}`);
        continue;
      }

      const subdomainName = item.subdomain;
      const sanitizedSubdomain = subdomainName.toLowerCase().replace(/[^a-z0-9-]/g, '');
      
      try {
        // Check if subdomain already exists
        const existing = await getSubdomainData(sanitizedSubdomain);
        
        if (existing) {
          // Skip existing subdomains (no duplicates)
          skipped++;
          continue;
        }

        // Restore the subdomain data
        await redis.set(`subdomain:${sanitizedSubdomain}`, item.fullData);
        restored++;
        
      } catch (subError) {
        errors.push(`Failed to restore ${subdomainName}: ${subError}`);
        continue;
      }
    }

    return {
      success: true,
      stats: {
        processed,
        restored,
        skipped,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 5) : [] // Limit error messages
    };

  } catch (error) {
    console.error('Error restoring from backup:', error);
    return {
      success: false,
      error: `Failed to parse backup file: ${error}`,
      stats: { processed: 0, restored: 0, skipped: 0 }
    };
  }
}

// NUCLEAR: Delete ALL subdomains from the database
export async function nuclearDeleteAllSubdomains() {
  try {
    // Get all subdomain keys
    const keys = await redis.keys('subdomain:*');
    
    if (keys.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'No subdomains found to delete'
      };
    }

    // Delete all subdomain keys
    const deletedCount = await redis.del(...keys);

    return {
      success: true,
      deletedCount: deletedCount,
      message: `Successfully deleted ${deletedCount} subdomains`
    };

  } catch (error) {
    console.error('Nuclear delete error:', error);
    return {
      success: false,
      deletedCount: 0,
      message: `Failed to delete subdomains: ${error}`
    };
  }
} 