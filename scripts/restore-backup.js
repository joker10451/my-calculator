/**
 * Скрипт для восстановления из backup
 * Использование: node scripts/restore-backup.js <backup-name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function restoreBackup() {
  try {
    // Получаем имя backup из аргументов
    const backupName = process.argv[2];

    if (!backupName) {
      console.log('📋 Доступные backup\'ы:');
      listBackups();
      console.log('');
      console.log('💡 Использование: node scripts/restore-backup.js <backup-name>');
      process.exit(0);
    }

    const backupPath = path.join(BACKUP_DIR, backupName);

    // Проверяем существование backup
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup "${backupName}" не найден`);
      console.log('');
      console.log('📋 Доступные backup\'ы:');
      listBackups();
      process.exit(1);
    }

    // Показываем информацию о backup
    console.log('📦 Информация о backup:');
    showBackupInfo(backupPath);
    console.log('');

    // Запрашиваем подтверждение
    const confirmed = await askConfirmation(
      '⚠️  Текущая версия dist будет удалена. Продолжить? (yes/no): '
    );

    if (!confirmed) {
      console.log('❌ Восстановление отменено');
      process.exit(0);
    }

    console.log('🔄 Восстановление из backup...');

    // Удаляем текущую dist директорию
    if (fs.existsSync(DIST_DIR)) {
      fs.rmSync(DIST_DIR, { recursive: true, force: true });
      console.log('🗑️  Текущая версия удалена');
    }

    // Копируем backup в dist
    copyDirectory(backupPath, DIST_DIR);

    // Удаляем файл метаданных из восстановленной версии
    const metadataPath = path.join(DIST_DIR, 'backup-metadata.json');
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    console.log('✅ Восстановление завершено успешно!');
    console.log(`📍 Восстановлено в: ${DIST_DIR}`);

  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error.message);
    process.exit(1);
  }
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('   (нет доступных backup\'ов)');
    return;
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(name => name.startsWith('backup-'))
    .map(name => {
      const backupPath = path.join(BACKUP_DIR, name);
      const stats = fs.statSync(backupPath);
      const metadataPath = path.join(backupPath, 'backup-metadata.json');
      
      let metadata = null;
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      return {
        name,
        time: stats.mtime,
        size: metadata?.sizeMB || 'unknown',
        version: metadata?.version || 'unknown'
      };
    })
    .sort((a, b) => b.time - a.time);

  if (backups.length === 0) {
    console.log('   (нет доступных backup\'ов)');
    return;
  }

  backups.forEach((backup, index) => {
    const date = backup.time.toLocaleString('ru-RU');
    console.log(`   ${index + 1}. ${backup.name}`);
    console.log(`      Дата: ${date}`);
    console.log(`      Размер: ${backup.size} MB`);
    console.log(`      Версия: ${backup.version}`);
    console.log('');
  });
}

function showBackupInfo(backupPath) {
  const metadataPath = path.join(backupPath, 'backup-metadata.json');
  
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`   Дата создания: ${new Date(metadata.timestamp).toLocaleString('ru-RU')}`);
    console.log(`   Размер: ${metadata.sizeMB} MB`);
    console.log(`   Файлов: ${metadata.files}`);
    console.log(`   Версия: ${metadata.version}`);
  } else {
    const stats = fs.statSync(backupPath);
    console.log(`   Дата создания: ${stats.mtime.toLocaleString('ru-RU')}`);
  }
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Запускаем восстановление
restoreBackup();
