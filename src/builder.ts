import {Ecto} from 'ecto';
import fs from 'fs-extra';
import {WritrOptions} from './options.js';
import {type GithubData, Github, type GithubOptions} from './github.js';

export type WritrData = {
	github?: GithubData;
	templates?: WritrTemplates;
};

export type WritrTemplates = {
	index: string;
	releases: string;
};

export class WritrBuilder {
	private readonly _options: WritrOptions = new WritrOptions();
	private readonly _ecto: Ecto = new Ecto();
	constructor(options?: WritrOptions) {
		if (options) {
			this._options = options;
		}
	}

	public get options(): WritrOptions {
		return this._options;
	}

	public async build(): Promise<void> {
		// Validate the options
		this.validateOptions(this.options);
		// Get data from github
		const githubData = await this.getGithubData(this.options.githubPath);
		// Get data of the site
		const writrData: WritrData = {
			github: githubData,
		};
		// Get the templates to use
		writrData.templates = await this.getTemplates(this.options);

		// Build the home page (index.html)

		// build the releases page (/releases/index.html)

		// build the rss feed (/rss.xml)

		// build the sitemap (/sitemap.xml)

		// build the robots.txt (/robots.txt)
		console.log('build');
	}

	public validateOptions(options: WritrOptions): void {
		if (options.githubPath.length < 3) {
			throw new Error('No github options provided');
		}

		if (options.siteDescription.length < 3) {
			throw new Error('No site description options provided');
		}

		if (!options.siteTitle) {
			throw new Error('No site title options provided');
		}

		if (!options.siteUrl) {
			throw new Error('No site url options provided');
		}
	}

	public async getGithubData(githubPath: string): Promise<GithubData> {
		const paths = githubPath.split('/');
		const options: GithubOptions = {
			author: paths[0],
			repo: paths[1],
		};
		const github = new Github(options);
		return github.getData();
	}

	public async getTemplates(options: WritrOptions): Promise<WritrTemplates> {
		const templates: WritrTemplates = {
			index: '',
			releases: '',
		};

		if (await fs.pathExists(options.templatePath)) {
			const index = await this.getTemplateFile(options.templatePath, 'index');
			if (index) {
				templates.index = index;
			}

			const releases = await this.getTemplateFile(options.templatePath, 'releases');
			if (releases) {
				templates.releases = releases;
			}
		} else {
			throw new Error('No template path found');
		}

		return templates;
	}

	public async getTemplateFile(path: string, name: string): Promise<string | undefined> {
		let result;
		const files = await fs.readdir(path);
		for (const file of files) {
			const fileName = file.split('.');
			if (fileName[0].toString().toLowerCase() === name.toLowerCase()) {
				result = file.toString();
				break;
			}
		}

		return result;
	}
}
