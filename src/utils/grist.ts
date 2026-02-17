import { createClient } from "grist-js";

const gristLocalClient = createClient({
	BASE: process.env.GRIST_DOC_URL as string,
	TOKEN: process.env.GRIST_API_KEY as string,
});

const gristDataOfficeClient = createClient({
	BASE: process.env.GRIST_DOC_URL as string,
	TOKEN: process.env.GRIST_DATA_OFFICE_API_KEY as string,
});

export { gristLocalClient, gristDataOfficeClient };
