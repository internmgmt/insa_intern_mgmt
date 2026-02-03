import { UniversityEntity } from '../entities/university.entity';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

export function mapUniversityToResponse(university: UniversityEntity) {
  const coordinator: UserEntity | undefined = (university.users || []).find(
    (u) => u.role === UserRole.UNIVERSITY,
  );

  return {
    id: university.id,
    name: university.name,
    address: university.address ?? null,
    contactEmail: university.contactEmail ?? null,
    contactPhone: university.contactPhone ?? null,
    isActive: university.isActive,
    createdAt: university.createdAt,
    updatedAt: university.updatedAt,
    coordinator: coordinator
      ? {
          id: coordinator.id,
          email: coordinator.email,
          firstName: coordinator.firstName,
          lastName: coordinator.lastName,
          isActive: coordinator.isActive,
        }
      : null,
    applicationCount: Array.isArray(university.applications)
      ? university.applications.length
      : 0,
  };
}

export function mapUniversitiesToResponse(universities: UniversityEntity[]) {
  return universities.map(mapUniversityToResponse);
}
