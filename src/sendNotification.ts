import request from "request";

/**
 * Sends a MS Teams notification
 * @param title
 * @param body
 */
export async function sendTeamsNotification(title: string, body: string, webhookUrl: string) {
	const data = `{ '@context': 'http://schema.org/extensions', '@type': 'MessageCard', 'title': '${title}', 'text': '${body}' }`;
	request(webhookUrl, {
		method: "POST",
		body: data
	})
}