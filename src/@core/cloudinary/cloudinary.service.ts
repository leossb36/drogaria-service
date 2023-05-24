import { BadRequestException, Injectable } from '@nestjs/common';
import { Cloudinary } from './cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private cloudinary: Cloudinary) {}

  async create(fileTransferable: Express.Multer.File, query: string) {
    try {
      return await this.cloudinary.upload(fileTransferable, query);
    } catch (error) {
      throw new BadRequestException(
        `Erro ao realizar upload do arquivo:: ${error.message}`,
      );
    }
  }

  async getFileUrl(fileId: string) {
    return this.cloudinary.getFileUrl(fileId);
  }

  async remove(id: string) {
    return this.cloudinary.delete(id);
  }
}
