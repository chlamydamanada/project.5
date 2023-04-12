import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing/all-data')
export class DeleteAllDataController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await Promise.all([
      this.dataSource.query(`DELETE FROM public."device"`),
      this.dataSource.query(`DELETE FROM public."ban_info"`),
      this.dataSource.query(`DELETE FROM public."email_confirmation_info"`),
      this.dataSource.query(`DELETE FROM public."password_recovery_info"`),
      this.dataSource.query(`DELETE FROM public."post_like_status"`),
      this.dataSource.query(`DELETE FROM public."ban_list"`),
      this.dataSource.query(`DELETE FROM public."blog_ban_info"`),
      this.dataSource.query(`DELETE FROM public."question"`),
    ]);
    await this.dataSource.query(`DELETE FROM public."comment"`);
    await this.dataSource.query(`DELETE FROM public."post"`);
    await this.dataSource.query(`DELETE FROM public."blog"`);
    await this.dataSource.query(`DELETE FROM public."user"`);
    return;
  }
}
