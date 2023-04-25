import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing/all-data')
export class DeleteAllDataController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  @Delete()
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
    
    delete from public."question_of_game";
    delete from public."game";
    delete from public."question";
    
    delete from public."answer";
    delete from public."player_progress";
    
    delete from public."comment_like_status";
    delete from public."comment";
   
    delete from public."post_like_status";
    delete from public."post" cascade;
    
    delete from public."blog_ban_info";
    delete from public."ban_list";
    delete from public."blog";
    
    delete from public."device";
    delete from public."ban_info";
    delete from public."email_confirmation_info";
    delete from public."password_recovery_info";
    
    delete from public."user" cascade;`);
    return;
  }
}
