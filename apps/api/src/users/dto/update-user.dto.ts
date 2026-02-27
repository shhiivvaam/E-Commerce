import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL' })
    @IsString()
    @IsOptional()
    avatar?: string;
}
