// generateAdminHash.js (ESM version)
import readline from 'node:readline';
import bcrypt from 'bcryptjs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash for admin: ', (password) => {
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('\nHashed password for admin (copy and use in MongoDB):');
    console.log(hash);
    rl.close();
  });
}); 