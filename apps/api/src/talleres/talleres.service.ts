import { Injectable } from '@nestjs/common';
import { CreateTallereDto } from './dto/create-tallere.dto';
import { UpdateTallereDto } from './dto/update-tallere.dto';

@Injectable()
export class TalleresService {
  create(createTallereDto: CreateTallereDto) {
    return 'This action adds a new tallere';
  }

  findAll() {
    return `This action returns all talleres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tallere`;
  }

  update(id: number, updateTallereDto: UpdateTallereDto) {
    return `This action updates a #${id} tallere`;
  }

  remove(id: number) {
    return `This action removes a #${id} tallere`;
  }
}
