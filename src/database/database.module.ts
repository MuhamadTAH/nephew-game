import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('SUPABASE_URL') || '';
        const anonKey = configService.get<string>('SUPABASE_ANON_KEY') || '';
        return createClient(url, anonKey);
      },
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: ['SUPABASE_CLIENT', DatabaseService],
})
export class DatabaseModule {}