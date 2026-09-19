// =============================================================================
// STORAGE SERVICE - MinIO / S3 Object Storage Interface (AWS SDK v3)
// =============================================================================

const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable, PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Initialize AWS S3 v3 client configured for MinIO
const s3Client = new S3Client({
  endpoint: config.s3.endpoint || 'https://s3.nighwantech.com',
  region: config.s3.region || 'us-east-1',
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  forcePathStyle: true
});

const BUCKET = config.s3.bucket || 'gsttaxwale';
const ENDPOINT = (config.s3.endpoint || 'https://s3.nighwantech.com').replace(/\/$/, '');

/**
 * Sanitize filename to prevent path traversal and unsafe characters
 */
function sanitizeFileName(filename) {
  if (!filename) return 'unnamed_file';
  const basename = path.basename(filename);
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Generate full public URL for an object key
 * Bucket is configured as public-read: https://s3.nighwantech.com/gsttaxwale/<objectKey>
 */
function getPublicUrl(objectKey) {
  if (!objectKey) return '';
  const cleanKey = objectKey.replace(/^\//, '');
  return `${ENDPOINT}/${BUCKET}/${cleanKey}`;
}

/**
 * Upload a file or buffer to MinIO S3 using AWS SDK v3
 */
async function upload({ fileBuffer, filePath, objectKey, mimeType }) {
  if (!objectKey) {
    throw new Error('StorageService.upload: objectKey is required');
  }

  let body = fileBuffer;
  let size = 0;

  if (!body && filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`StorageService.upload: File not found at path ${filePath}`);
    }
    body = fs.readFileSync(filePath);
    size = body.length;
  } else if (fileBuffer) {
    size = fileBuffer.length;
  } else {
    throw new Error('StorageService.upload: Either fileBuffer or filePath must be provided');
  }

  const cleanKey = objectKey.replace(/^\//, '');

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: cleanKey,
    Body: body,
    ContentType: mimeType || 'application/octet-stream',
  });

  try {
    await s3Client.send(command);
    const publicUrl = getPublicUrl(cleanKey);

    return {
      objectKey: cleanKey,
      bucket: BUCKET,
      url: publicUrl,
      location: publicUrl,
      size
    };
  } catch (err) {
    console.error(`❌ StorageService.upload failed for key ${cleanKey}:`, err.message);
    throw err;
  }
}

/**
 * Delete an object from MinIO S3
 */
async function deleteObject(objectKey) {
  if (!objectKey) return;
  const cleanKey = objectKey.replace(/^\//, '');

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: cleanKey
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error(`❌ StorageService.delete failed for key ${cleanKey}:`, err.message);
    throw err;
  }
}

/**
 * Check if object exists in MinIO S3
 */
async function exists(objectKey) {
  if (!objectKey) return false;
  const cleanKey = objectKey.replace(/^\//, '');

  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET, Key: cleanKey });
    await s3Client.send(command);
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404 || err.code === 'NotFound') {
      return false;
    }
    throw err;
  }
}

/**
 * Get read stream for object from MinIO S3
 */
function getReadStream(objectKey) {
  if (!objectKey) throw new Error('StorageService.getReadStream: objectKey is required');
  const cleanKey = objectKey.replace(/^\//, '');

  const passthrough = new PassThrough();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: cleanKey });

  s3Client.send(command).then(response => {
    if (response.Body && typeof response.Body.pipe === 'function') {
      response.Body.pipe(passthrough);
    } else if (response.Body) {
      Readable.from(response.Body).pipe(passthrough);
    }
  }).catch(err => {
    passthrough.emit('error', err);
  });

  return passthrough;
}

/**
 * Get object metadata from MinIO S3
 */
async function getObjectInfo(objectKey) {
  if (!objectKey) return null;
  const cleanKey = objectKey.replace(/^\//, '');

  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET, Key: cleanKey });
    const data = await s3Client.send(command);
    return {
      contentLength: data.ContentLength,
      contentType: data.ContentType,
      lastModified: data.LastModified,
      etag: data.ETag
    };
  } catch (err) {
    return null;
  }
}

module.exports = {
  upload,
  delete: deleteObject,
  exists,
  getReadStream,
  getObjectInfo,
  getPublicUrl,
  sanitizeFileName,
  BUCKET,
  ENDPOINT
};
