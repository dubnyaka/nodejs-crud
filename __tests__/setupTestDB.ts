import { MikroORM } from '@mikro-orm/core';
import config from '../src/mikro-orm.config';

module.exports = async () => {
    const orm = await MikroORM.init(config);
    await orm.getMigrator().up();
    await orm.close();
};