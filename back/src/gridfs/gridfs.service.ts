// src/gridfs/gridfs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as mongoose from 'mongoose';
import { Readable } from 'stream';
import { Express } from 'express';

/*
|--------------------------------------------------------------------------
| Interfaces
|--------------------------------------------------------------------------
*/

interface StoredAudioFile {
  fileId: string;
  filename: string;
  size: number;
}

/*
|--------------------------------------------------------------------------
| GridFS Service
|--------------------------------------------------------------------------
*/

@Injectable()
export class GridFSService {
  private readonly logger = new Logger(GridFSService.name);
  private gridFSBucket: mongoose.mongo.GridFSBucket;

  constructor(@InjectConnection() private connection: Connection) {

    // If connection already exists
    if (this.connection.db) {
      this.initializeGridFS();
    }

    // Listen for connection events
    this.connection.on('connected', () => {
      this.initializeGridFS();
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Initialize GridFS Bucket
  |--------------------------------------------------------------------------
  */
  private initializeGridFS() {
    if (!this.connection.db) {
      this.logger.error('Cannot initialize GridFS: No database connection');
      return;
    }

    try {
      this.gridFSBucket = new mongoose.mongo.GridFSBucket(this.connection.db, {
        bucketName: 'audioRecordings',
        chunkSizeBytes: 255 * 1024,
      });

      this.logger.log('GridFSBucket initialized successfully');
    } catch (error) {
      this.logger.error('GridFSBucket initialization failed:', error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Store Audio File
  |--------------------------------------------------------------------------
  */
  async storeAudio(
    file: Express.Multer.File,
    metadata: any,
  ): Promise<StoredAudioFile> {

    if (!this.gridFSBucket) {
      throw new Error('GridFSBucket not initialized. Check MongoDB connection.');
    }

    return new Promise((resolve, reject) => {

      try {
        const uploadStream = this.gridFSBucket.openUploadStream(
          file.originalname,
          {
            metadata: {
              ...metadata,
              uploadedAt: new Date(),
              originalName: file.originalname,
              mimeType: file.mimetype,
            },
          },
        );

        uploadStream.on('error', reject);

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        | GridFS does NOT return file metadata in events.
        | So we query the file after upload.
        |--------------------------------------------------------------------------
        */

        uploadStream.on('close', async () => {
          try {
            const files = await this.gridFSBucket
              .find({ filename: file.originalname })
              .sort({ uploadDate: -1 })
              .limit(1)
              .toArray();

            const uploadedFile = files[0];

            if (!uploadedFile) {
              throw new Error('Uploaded file not found in GridFS');
            }

            resolve({
              fileId: uploadedFile._id.toString(),
              filename: uploadedFile.filename,
              size: uploadedFile.length,
            });

          } catch (err) {
            reject(err);
          }
        });

        /*
        |--------------------------------------------------------------------------
        | Stream buffer → GridFS stream
        |--------------------------------------------------------------------------
        */

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        readableStream.pipe(uploadStream);

      } catch (err) {
        reject(err);
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Get Audio Stream
  |--------------------------------------------------------------------------
  */
  async getAudioStream(fileId: string): Promise<Readable> {

    if (!this.gridFSBucket) {
      throw new Error('GridFSBucket not initialized');
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    return this.gridFSBucket.openDownloadStream(objectId);
  }

  /*
  |--------------------------------------------------------------------------
  | Get Audio as Buffer (NEW - For AssemblyAI)
  |--------------------------------------------------------------------------
  */
  async getFileAsBuffer(fileId: string): Promise<Buffer> {
    this.logger.log(`Getting file as buffer: ${fileId}`);

    if (!this.gridFSBucket) {
      throw new Error('GridFSBucket not initialized');
    }

    return new Promise((resolve, reject) => {
      const objectId = new mongoose.Types.ObjectId(fileId);
      const chunks: Buffer[] = [];
      
      const downloadStream = this.gridFSBucket.openDownloadStream(objectId);
      
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      downloadStream.on('error', (error) => {
        this.logger.error(`Error downloading file ${fileId}:`, error);
        reject(error);
      });
      
      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        this.logger.log(`File ${fileId} downloaded, size: ${buffer.length} bytes`);
        resolve(buffer);
      });
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Get File Metadata (NEW - Useful for debugging)
  |--------------------------------------------------------------------------
  */
  async getFileMetadata(fileId: string): Promise<any> {
    if (!this.gridFSBucket) {
      throw new Error('GridFSBucket not initialized');
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    const files = await this.gridFSBucket.find({ _id: objectId }).toArray();
    
    if (files.length === 0) {
      throw new Error(`File not found: ${fileId}`);
    }
    
    return files[0];
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Audio File
  |--------------------------------------------------------------------------
  */
  async deleteAudio(fileId: string): Promise<void> {

    if (!this.gridFSBucket) {
      throw new Error('GridFSBucket not initialized');
    }

    const objectId = new mongoose.Types.ObjectId(fileId);
    await this.gridFSBucket.delete(objectId);
    this.logger.log(`File ${fileId} deleted successfully`);
  }
}