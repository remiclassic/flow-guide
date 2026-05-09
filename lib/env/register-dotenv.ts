import { loadRootEnvFiles } from './load-dotenv';

/** Import this module first in CLI scripts so env is loaded before `session` or `drizzle`. */
loadRootEnvFiles();
