import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'john@example.com',
        description: 'User email address',
    })
    email: string;

    @ApiProperty({
        example: 'StrongP@ssword123',
        description: 'User password',
    })
    password: string;
}

export class RegisterDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
    })
    name: string;

    @ApiProperty({
        example: 'john@example.com',
        description: 'User email address',
    })
    email: string;

    @ApiProperty({
        example: 'StrongP@ssword123',
        description: 'User password (min 8 characters)',
    })
    password: string;
}

export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;

    @ApiProperty({
        example: { id: 'clx...', email: 'john@example.com', name: 'John Doe' },
    })
    user: {
        id: string;
        email: string;
        name: string;
    };
}
