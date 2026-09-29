/* Packages */
import path from 'path';
import { pathToFileURL } from 'url';

/* Import a data file from the project's src/_core/data folder (scripts run from the project root) */
/* Note: these are TypeScript files, which Node can import directly since they're outside node_modules */
export const importData = (name) => import(pathToFileURL(path.resolve(`src/_core/data/${name}.ts`)).href);
