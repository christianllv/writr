import type http from 'node:http';
import fs from 'fs-extra';
import updateNotifier from 'update-notifier';
import express from 'express';
import {register} from 'ts-node';
import packageJson from '../package.json';
import {WritrOptions} from './options.js';
import {WritrConsole} from './console.js';
import {WritrBuilder} from './builder.js';

export default class Writr {
	private _options: WritrOptions = new WritrOptions();
	private readonly _console: WritrConsole = new WritrConsole();
	private _configFileModule: any = {};
	private _server: http.Server | undefined;

	constructor(options?: WritrOptions) {
		if (options) {
			this._options = options;
		}
	}

	public get options(): WritrOptions {
		return this._options;
	}

	public set options(value: WritrOptions) {
		this._options = value;
	}

	public get server(): http.Server | undefined {
		return this._server;
	}

	public get configFileModule(): any {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this._configFileModule;
	}

	public async execute(process: NodeJS.Process): Promise<void> {
		// Check for updates
		updateNotifier({pkg: packageJson}).notify();

		// Load the Config File
		await this.loadConfigFile(this.options.sitePath);

		// Parse the config file
		if (this._configFileModule.options) {
			this.options.parseOptions(this._configFileModule.options as Record<string, any>);
		}

		// Run the onPrepare function
		try {
			if (this._configFileModule.onPrepare) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				await this._configFileModule.onPrepare(this.options);
			}
		} catch (error) {
			this._console.error((error as Error).message);
		}

		const consoleProcess = this._console.parseProcessArgv(process.argv);

		// Update options
		if (consoleProcess.args.sitePath) {
			this.options.sitePath = consoleProcess.args.sitePath;
		}

		if (consoleProcess.args.output) {
			this.options.outputPath = consoleProcess.args.output;
		}

		switch (consoleProcess.command) {
			case 'init': {
				const isTypescript = fs.existsSync('./tsconfig.json') ?? false;
				this.generateInit(this.options.sitePath, isTypescript);
				break;
			}

			case 'help': {
				this._console.printHelp();
				break;
			}

			case 'version': {
				this._console.log(this.getVersion());
				break;
			}

			case 'serve': {
				const builder = new WritrBuilder(this.options);
				await builder.build();
				await this.serve(this.options);
				break;
			}

			default: {
				const builder = new WritrBuilder(this.options);
				await builder.build();
				break;
			}
		}
	}

	public isSinglePageWebsite(sitePath: string): boolean {
		const docsPath = `${sitePath}/docs`;
		if (!fs.existsSync(docsPath)) {
			return true;
		}

		const files = fs.readdirSync(docsPath);
		return files.length === 0;
	}

	public generateInit(sitePath: string, isTypescript: boolean): void {
		// Check if the site path exists
		if (!fs.existsSync(sitePath)) {
			fs.mkdirSync(sitePath);
		}

		// Add the writr.config file based on js or ts
		const writrConfigFile = isTypescript ? './init/writr.config.ts' : './init/writr.config.js';
		fs.copyFileSync(writrConfigFile, `${sitePath}/writr.config.${isTypescript ? 'ts' : 'js'}`);

		// Add in the image and favicon
		fs.copyFileSync('./init/logo.png', `${sitePath}/logo.png`);
		fs.copyFileSync('./init/favicon.svg', `${sitePath}/favicon.svg`);

		// Add in the variables file
		fs.copyFileSync('./init/variables.css', `${sitePath}/variables.css`);

		// Output the instructions
		this._console.log(`Writr initialized. Please update the ${writrConfigFile} file with your site information. In addition, you can replace the image, favicon, and stype the site with site.css file.`);
	}

	public getVersion(): string {
		const packageJson = fs.readFileSync('./package.json', 'utf8');
		const packageObject = JSON.parse(packageJson) as {version: string};
		return packageObject.version;
	}

	public async loadConfigFile(sitePath: string): Promise<void> {
		if (fs.existsSync(sitePath)) {
			const isTypescript = fs.existsSync(`${sitePath}/writr.config.ts`);
			const configFile = isTypescript ? `${sitePath}/writr.config.ts` : `${sitePath}/writr.config.js`;
			if (isTypescript) {
				// Typescript
				register({transpileOnly: true});
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this._configFileModule = await import(configFile);
			} else {
				// Javascript
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				this._configFileModule = await import(configFile);
			}
		}
	}

	public async serve(options: WritrOptions): Promise<void> {
		if (this._server) {
			this._server.close();
		}

		const app = express();
		const {port} = options;
		const {outputPath} = options;

		app.use(express.static(outputPath));

		this._server = app.listen(port, () => {
			this._console.log(`Writr listening at http://localhost:${port}`);
		});
	}
}

export {WritrHelpers} from './helpers.js';
