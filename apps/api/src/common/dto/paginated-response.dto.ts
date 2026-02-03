import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: Object,
    example: {
      page: 1,
      limit: 10,
      totalItems: 100,
      totalPages: 10,
    },
  })
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };

  constructor(items: T[], page: number, limit: number, totalItems: number) {
    this.items = items;
    this.pagination = {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / (limit || 1))),
    };
  }
}
