import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

export async function getSupervisorCount(
  departmentId: string,
  userRepository: Repository<UserEntity>,
): Promise<number> {
  return userRepository.count({
    where: {
      departmentId,
      role: UserRole.SUPERVISOR,
      isActive: true,
    },
  });
}

export async function getInternCount(
  departmentId: string,
  userRepository: Repository<UserEntity>,
): Promise<number> {
  return userRepository.count({
    where: {
      departmentId,
      role: UserRole.INTERN,
      isActive: true,
    },
  });
}

export async function computeDepartmentStats(
  departmentId: string,
  userRepository: Repository<UserEntity>,
): Promise<{ supervisorCount: number; internCount: number }> {
  const [supervisorCount, internCount] = await Promise.all([
    getSupervisorCount(departmentId, userRepository),
    getInternCount(departmentId, userRepository),
  ]);

  return { supervisorCount, internCount };
}
