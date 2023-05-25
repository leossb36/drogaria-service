import { BadRequestException, Injectable } from '@nestjs/common';
import { Cloudinary } from './cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private cloudinary: Cloudinary) {}

  async create(product: any, query: string) {
    try {
      await this.cloudinary.uploadFromUrl(product, query);
      const resource = await this.cloudinary.getFileUrlCorrect(query);

      return {
        ...product,
        images: [
          {
            src: resource.url,
          },
        ],
      };
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
