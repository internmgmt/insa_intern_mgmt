
import dataSource from '../../type-orm.config';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

async function fixMentorLogin() {
  try {
    console.log('Connecting to database...');
    // dataSource is already instantiated but not initialized
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    console.log('Connected to database.');

    const userRepository = dataSource.getRepository(UserEntity);
    const email = 'sha@insa.gov.et';
    const targetPassword = 'password';
    const saltRounds = 10;

    console.log(`Looking for user: ${email}`);
    let user = await userRepository.findOne({ where: { email } });
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(targetPassword, saltRounds);

    if (user) {
      console.log(`User found (ID: ${user.id}). Updating password and ensuring active status...`);
      
      // Update fields
      user.passwordHash = hashedPassword;
      user.isActive = true;
      
      // Ensure role is MENTOR
      if (user.role !== UserRole.MENTOR) {
        console.log(`Updating role from ${user.role} to ${UserRole.MENTOR}`);
        user.role = UserRole.MENTOR;
      }
      
      await userRepository.save(user);
      console.log('User updated successfully.');
    } else {
      console.log('User not found. Creating new MENTOR user...');
      
      user = userRepository.create({
        email: email,
        passwordHash: hashedPassword,
        firstName: 'Sha', 
        lastName: 'Mentor', // Placeholder names
        role: UserRole.MENTOR,
        isActive: true,
        isFirstLogin: true,
      });
      
      await userRepository.save(user);
      console.log(`User created successfully with ID: ${user.id}`);
    }

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

fixMentorLogin();
