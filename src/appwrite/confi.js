import { databases } from "../appwrite/config"; // Import the databases object from your config

const databaseId = conf.appwriteDatabaseId;
const collectionId = conf.appwriteCollectionIdlocation;

export const getLocationsByLocation = async () => {
    try {
        const response = await databases.listDocuments(databaseId, collectionId);
        // Extract only the `location` attribute from each document
        const locations = response.documents.map((doc) => doc.location);
        return locations;
    } catch (error) {
        console.error("Error fetching locations:", error);
        throw error;
    }
};
