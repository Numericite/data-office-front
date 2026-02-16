import { createClient } from "grist-js";

// Initialize a client
const gristClient = createClient({
	BASE: process.env.GRIST_DOC_URL as string,
	TOKEN: process.env.GRIST_API_KEY as string,
});

export { gristClient };
