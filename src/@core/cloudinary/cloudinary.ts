import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import toStream = require('buffer-to-stream');
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class Cloudinary {
  constructor(@Inject('CONFIG') configService: ConfigService) {
    v2.config(configService.get('cloudinary'));
  }

  async upload(
    file: Express.Multer.File,
    query: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto', public_id: query },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async delete(fileId: string) {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(fileId, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  async getFileUrl(fileId: string) {
    let response: any = null;

    try {
      response = await v2.api.resource(fileId);
    } catch {
      try {
        response = await v2.api.resource(fileId, { resource_type: 'image' });
      } catch {
        response = await v2.api.resource(fileId, { resource_type: 'raw' });
      }
    }

    return response;
  }

  async getFileUrlCorrect(fileId: string) {
    return v2.api.resource(fileId);
  }

  async generateRecizedUrl(fileId: string) {
    return v2.url(fileId, {
      width: 500,
      height: 500,
      Crop: 'fill',
    });
  }
}
