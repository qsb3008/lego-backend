import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.baseUrl = 'http://127.0.0.1:7001'

  config.logger = {
    consoleLevel: 'DEBUG',
  }
  return config
};
