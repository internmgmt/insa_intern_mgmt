import { DataSource } from 'typeorm';
import { DepartmentEntity } from '../../entities/department.entity';
import { DepartmentType } from '../../common/enums/department-type.enum';

export async function departmentsSeed(dataSource: DataSource): Promise<void> {
  const departmentRepository = dataSource.getRepository(DepartmentEntity);

  const departments = [
    {
      name: 'Networking',
      type: DepartmentType.NETWORKING,
      description: 'Network infrastructure, administration, and security',
    },
    {
      name: 'Cybersecurity',
      type: DepartmentType.CYBERSECURITY,
      description: 'Information security, threat analysis, and defense',
    },
    {
      name: 'Software Development',
      type: DepartmentType.SOFTWARE_DEVELOPMENT,
      description: 'Application development and software engineering',
    },
  ];

  for (const dept of departments) {
    const existingDept = await departmentRepository.findOne({
      where: { name: dept.name },
    });

    if (existingDept) {
      console.log(`ℹ️  Department "${dept.name}" already exists, skipping...`);
      continue;
    }

    const newDept = departmentRepository.create(dept);
    await departmentRepository.save(newDept);
    console.log(`✅ Department "${dept.name}" created successfully`);
  }
}
