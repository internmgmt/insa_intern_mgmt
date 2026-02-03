import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SuspendInternDto {
    @ApiProperty({
        example: 'Awaiting disciplinary review',
        description: 'Reason for suspending the intern',
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    reason: string;
}
