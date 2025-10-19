import { Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Render
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './members/dto/create-member.dto';
import { UpdateMemberDto } from './members/dto/update-member.dto';

@Controller('members')
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    
    @Post()
    async create(@Body() createMemberDto: CreateMemberDto) {
        return this.membersService.create(createMemberDto);
    }
    
    @Get()
    @Render('pages/members/index')
    async findAll() {
        const members = await this.membersService.findAll();

        return {
            title: 'Daftar Anggota Koperasi',
            members: members,
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.membersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMemberDto: UpdateMemberDto,
    ) {
        return this.membersService.update(id, updateMemberDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.membersService.remove(id);
    }
}
