/**
 * Скрипт для создания backup текущей версии перед деплоем
 * Создает архив dist директории с timestamp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

function createBackup() {
  try {
    // Проверяем существование dist директории
    if (!fs.existsSync(DIST_DIR)) {
      console.error('❌ Директория dist не найдена. Сначала выполните сборку проекта.');
      process.exit(1);
    }

    // Создаем директорию для backup'ов
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('📁 Создана директория для backup\'ов');
    }

    // Генерируем имя backup файла с timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupName = `backup-${timestamp}-${time}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log('🔄 Создание backup...');
    console.log(`📦 Имя backup: ${backupName}`);

    // Копируем dist директорию
    copyDirectory(DIST_DIR, backupPath);

    // Получаем размер backup
    const backupSize = getDirectorySize(backupPath);
    const backupSizeMB = (backupSize / 1024 / 1024).toFixed(2);

    console.log('✅ Backup успешно создан!');
    console.log(`📍 Путь: ${backupPath}`);
    console.log(`📊 Размер: ${backupSizeMB} MB`);

    // Создаем файл с метаданными
    const metadata = {
      timestamp: new Date().toISOString(),
      size: backupSize,
      sizeMB: backupSizeMB,
      files: countFiles(backupPath),
      version: getPackageVersion()
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf8'
    );

    // Очищаем старые backup'ы (оставляем последние 5)
    cleanOldBackups();

    console.log('');
    console.log('💡 Для восстановления из backup выполните:');
    console.log(`   node scripts/restore-backup.js ${backupName}`);

  } catch (error) {
    console.error('❌ Ошибка при создании backup:', error.message);
    process.exit(1);
  }
}

function copyDirectory(src, dest) {
  // Создаем целевую директорию
  fs.mkdirSync(dest, { recursive: true });

  // Читаем содержимое исходной директории
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

function getDirectorySize(dirPath) {
  let size = 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      const stats = fs.statSync(fullPath);
      size += stats.size;
    }
  }

  return size;
}

function countFiles(dirPath) {
  let count = 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }

  return count;
}

function getPackageVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function cleanOldBackups() {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(BACKUP_DIR, name),
        time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Оставляем последние 5 backup'ов
    const backupsToDelete = backups.slice(5);

    if (backupsToDelete.length > 0) {
      console.log(`🗑️  Удаление старых backup'ов (${backupsToDelete.length})...`);

      for (const backup of backupsToDelete) {
        fs.rmSync(backup.path, { recursive: true, force: true });
        console.log(`   Удален: ${backup.name}`);
      }
    }
  } catch (error) {
    console.warn('⚠️  Не удалось очистить старые backup\'ы:', error.message);
  }
}

// Запускаем создание backup
createBackup();
