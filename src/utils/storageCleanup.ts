import { supabase } from './supabaseClient';

// Fungsi untuk mendapatkan semua file yang sedang digunakan
export async function getUsedFiles() {
  const usedFiles: string[] = [];

  try {
    // Ambil semua projects
    const { data: projects } = await supabase
      .from('projects')
      .select('image')
      .not('image', 'is', null);
    
    if (projects) {
      projects.forEach(project => {
        if (project.image) {
          const fileName = project.image.split('/').pop();
          if (fileName) usedFiles.push(fileName);
        }
      });
    }

    // Ambil semua certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('image')
      .not('image', 'is', null);
    
    if (certificates) {
      certificates.forEach(cert => {
        if (cert.image) {
          const fileName = cert.image.split('/').pop();
          if (fileName) usedFiles.push(fileName);
        }
      });
    }

    // Ambil semua experiences
    const { data: experiences } = await supabase
      .from('experiences')
      .select('image')
      .not('image', 'is', null);
    
    if (experiences) {
      experiences.forEach(exp => {
        if (exp.image) {
          const fileName = exp.image.split('/').pop();
          if (fileName) usedFiles.push(fileName);
        }
      });
    }

    // Ambil profile data (untuk CV dan profile image)
    const { data: profile } = await supabase
      .from('profile')
      .select('cv_url, photo_url')
      .single();
    
    if (profile) {
      // CV file
      if (profile.cv_url) {
        const fileName = profile.cv_url.split('/').pop();
        if (fileName) usedFiles.push(fileName);
      }
      
      // Profile image
      if (profile.photo_url) {
        const fileName = profile.photo_url.split('/').pop();
        if (fileName) usedFiles.push(fileName);
      }
    }

    console.log('All used files found:', usedFiles);
    return usedFiles;
  } catch (error) {
    console.error('Error getting used files:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan semua file di storage bucket
export async function getAllStorageFiles(bucketName: string) {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing storage files:', error);
      return [];
    }

    return files || [];
  } catch (error) {
    console.error('Error getting storage files:', error);
    return [];
  }
}

// Fungsi untuk menghapus file yang tidak terpakai
export async function cleanupUnusedFiles() {
  try {
    console.log('Starting storage cleanup...');
    
    // Dapatkan semua file yang sedang digunakan
    const usedFiles = await getUsedFiles();
    console.log('Used files:', usedFiles);

    // Bucket names yang akan dibersihkan
    const buckets = ['project-images', 'certificate-images', 'experience-images', 'profile-images', 'cv-files'];
    
    let totalDeleted = 0;

    for (const bucketName of buckets) {
      // Dapatkan semua file di bucket
      const storageFiles = await getAllStorageFiles(bucketName);
      
      // Filter file yang tidak digunakan
      const unusedFiles = storageFiles.filter(file => 
        !usedFiles.includes(file.name) && file.name !== '.emptyFolderPlaceholder'
      );

      if (unusedFiles.length > 0) {
        console.log(`Found ${unusedFiles.length} unused files in ${bucketName}:`, unusedFiles.map(f => f.name));
        
        // Hapus file yang tidak digunakan
        const filesToDelete = unusedFiles.map(file => file.name);
        
        const { error } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);

        if (error) {
          console.error(`Error deleting files from ${bucketName}:`, error);
        } else {
          console.log(`Successfully deleted ${filesToDelete.length} files from ${bucketName}`);
          totalDeleted += filesToDelete.length;
        }
      } else {
        console.log(`No unused files found in ${bucketName}`);
      }
    }

    console.log(`Storage cleanup completed. Total files deleted: ${totalDeleted}`);
    return { success: true, deletedCount: totalDeleted };
    
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Fungsi untuk menghapus file lama (lebih dari 30 hari dan tidak digunakan)
export async function cleanupOldUnusedFiles(daysOld: number = 30) {
  try {
    console.log(`Starting cleanup of files older than ${daysOld} days...`);
    
    const usedFiles = await getUsedFiles();
    const buckets = ['project-images', 'certificate-images', 'experience-images', 'profile-images', 'cv-files'];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let totalDeleted = 0;

    for (const bucketName of buckets) {
      const storageFiles = await getAllStorageFiles(bucketName);
      
      // Filter file lama yang tidak digunakan
      const oldUnusedFiles = storageFiles.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate && 
               !usedFiles.includes(file.name) && 
               file.name !== '.emptyFolderPlaceholder';
      });

      if (oldUnusedFiles.length > 0) {
        console.log(`Found ${oldUnusedFiles.length} old unused files in ${bucketName}`);
        
        const filesToDelete = oldUnusedFiles.map(file => file.name);
        
        const { error } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);

        if (error) {
          console.error(`Error deleting old files from ${bucketName}:`, error);
        } else {
          console.log(`Successfully deleted ${filesToDelete.length} old files from ${bucketName}`);
          totalDeleted += filesToDelete.length;
        }
      }
    }

    console.log(`Old files cleanup completed. Total files deleted: ${totalDeleted}`);
    return { success: true, deletedCount: totalDeleted };
    
  } catch (error) {
    console.error('Error during old files cleanup:', error);
    return { success: false, error: (error as Error).message };
  }
}