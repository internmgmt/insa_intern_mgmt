
import dataSource from '../../type-orm.config';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../entities/user.entity';

async function resetMentorPassword() {
  try {
    console.log('Connecting to database...');
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    console.log('Connected to database.');

    const userRepository = dataSource.getRepository(UserEntity);
    const email = 'sha@insa.gov.et';
    const targetPassword = 'k5`VTe(!g3r5'; 
    // Re-reading: "New Password: `k5\`VTe(!g3r5`"
    // In many contexts `\` is an escape char.
    // I will try to set it to 'k5`VTe(!g3r5' because `\` usually escapes the backtick in markdown.
    // If the user meant literal backslash, they would double it `\\`.
    
    // Wait, looking at the user prompt again.
    // The user wrote: New Password: `k5\`VTe(!g3r5`
    // In the rendered markdown of the prompt, this looks like k5`VTe(!g3r5.
    // So the password is `k5`VTe(!g3r5`.
    
    const saltRounds = 10;

    console.log(`Looking for user: ${email}`);
    let user = await userRepository.findOne({ where: { email } });
    
    const hashedPassword = await bcrypt.hash(targetPassword, saltRounds);

    if (user) {
      console.log(`Updating password for ${user.email}...`);
      user.passwordHash = hashedPassword;
      await userRepository.save(user);
      console.log('Password updated successfully.');
    } else {
      console.log('User not found.');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetMentorPassword();
