// src/gridfs/gridfs.module.ts
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GridFSService } from './gridfs.service';

@Global()
@Module({
  imports: [
    // Import MongooseModule to make Connection available
    MongooseModule.forFeature([]) // This alone doesn't provide Connection
    // You need to import the root MongooseModule in your AppModule
  ],
  providers: [GridFSService],
  exports: [GridFSService],
})
export class GridFSModule {}