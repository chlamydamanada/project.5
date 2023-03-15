import bcrypt from 'bcrypt';

export class BcryptAdapter {
  async generatePasswordHash(password: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  async checkPassword(password: string, hash: string) {
    const salt = hash.slice(0, 29);
    const checkedHash = await bcrypt.hash(password, salt);
    return checkedHash === hash;
  }
}
