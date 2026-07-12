import { ApiProperty } from "@nestjs/swagger";

export class ProductForbiddenResponse {
    @ApiProperty({
        type: String,
        example: 403,
        description: 'Http error code'
    })
    statusCode!: number;
    @ApiProperty({
        type: String,
        example: 'You do not have permission to access this resource',
        description: 'Http error message'
    })
    message!: string;
}