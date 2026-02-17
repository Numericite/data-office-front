import { createClient } from "grist-js";

const gristDataOfficeClient = createClient({
	BASE: process.env.GRIST_DOC_URL as string,
	TOKEN: process.env.GRIST_DATA_OFFICE_API_KEY as string,
});

export { gristDataOfficeClient };
