import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		const octopusUrl: string = core.getInput("OCTOPUS_URL", { required: true });
		const octopusApiKey: string = core.getInput("OCTOPUS_APIKEY", { required: true });
		const solutionPath: string = core.getInput("SOLUTION_PATH", { required: true });
		const project: string = core.getInput("PROJECT", { required: false });
		const deployTo: string = core.getInput("DEPLOY_TO", { required: false });
		const msTeamsWebhook: string = core.getInput("MS_TEAMS_WEBHOOK", { required: false });
		const context = github.context;
		const repo = context.repo.repo;
		const projectName = project ? project : repo;

		if (context.ref.indexOf("refs/tags/") === -1) {
			throw new Error("Unable to get a version number");
		}
		const version = context.ref.replace("refs/tags/", "");
		core.info(`🐙 Deploying project ${projectName} (Version ${version}) to Octopus `);
		core.info("Installing octopus cli...");
		await exec(`dotnet tool install octopus.dotnet.cli --tool-path .`);
		core.info("Packing Solution...");
		await exec(`.\\dotnet-octo.exe pack --id=${repo} --outFolder=output --basePath=${solutionPath} --version=${version}`);
		core.info("Pushing to Octopus...");
		await exec(`.\\dotnet-octo push --package=output\\${repo}.${version}.nupkg --server=${octopusUrl} --apiKey=${octopusApiKey}`);
		core.info("Creating Release...");
		const deployToString = deployTo ? `--deployTo=${deployTo}` : "";
		await exec(`.\\dotnet-octo create-release --project=${projectName} --version=${version} --server=${octopusUrl} --apiKey=${octopusApiKey} ${deployToString}`);
		if (msTeamsWebhook) {
			sendTeamsNotification(projectName, `✔ Version ${version} Deployed to Octopus`, msTeamsWebhook);
		}
		core.info("✅ complete");
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

/**
 * Sends a MS Teams notification
 * @param title
 * @param body
 */
async function sendTeamsNotification(title: string, body: string, webhookUrl: string) {
	const data = `"{ '@context': 'http://schema.org/extensions', '@type': 'MessageCard', 'title': '${title}', 'text': '${body}' }"`;
	core.info("Sending Teams notification...");
	await exec(`curl --url "${webhookUrl}" -d ${data}`);
}

main();
