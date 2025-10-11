import { Controller, Get } from '@nestjs/common';
import path from 'path';
import fs from 'fs';

interface PackageJson {
  version: string;
}

@Controller('health')
export class HealthController {
  @Get()
  async getVersion() {
    const packageJSONPath = path.join(process.cwd(), 'package.json');

    const data = await fs.promises.readFile(packageJSONPath, 'utf8');
    const { version } = JSON.parse(data) as PackageJson;

    return { version };
  }
}
