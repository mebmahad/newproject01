import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

class InOutService {
    constructor() {
        this.client = new Client()
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async createInForm({ Items, securelocation, timestamp, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdinform,
                id,
                {
                    Items,
                    securelocation,
                    timestamp,
                }
            );
        } catch (error) {
            console.log("InFormService :: createInForm :: error", error);
        }
    }

    async updateInForm(id, { Items, securelocation }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdinform,
                id,
                {
                    Items,
                    securelocation,
                }
            );
        } catch (error) {
            console.log("InFormService :: updateInForm :: error", error);
        }
    }

    async deleteInForm(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdinform,
                id
            );
            return true;
        } catch (error) {
            console.log("InFormService :: deleteInForm :: error", error);
            return false;
        }
    }
    
    async getInForm(id) {
        try {
            const document = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdinform,
                id
            );
    
            // Parse `Items` if it exists
            return {
                ...document,
                Items: document.Items ? JSON.parse(document.Items) : [], // Parse Items if available
            };
        } catch (error) {
            console.log("InFormService :: getInForm :: error", error);
            return false;
        }
    }

    async getInForms(queries = []) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdinform,
                queries
            );
    
            // Parse `Items` for each PO if it exists
            response.documents = response.documents.map((doc) => ({
                ...doc,
                Items: doc.Items ? JSON.parse(doc.Items) : [], // Parse Items if available
            }));
    
            return response;
        } catch (error) {
            console.log("InFormService :: getInForms :: error", error);
            return false;
        }
    }

    async createOutForm({ Items, securelocation, timestamp, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdoutform,
                id,
                {
                    Items,
                    securelocation,
                    timestamp,
                }
            );
        } catch (error) {
            console.log("OutFormService :: createOutForm :: error", error);
        }
    }

    async updateOutForm(id, { Items, securelocation }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdoutform,
                id,
                {
                    Items,
                    securelocation,
                }
            );
        } catch (error) {
            console.log("OutFormService :: updateOutForm :: error", error);
        }
    }

    async deleteOutForm(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdoutform,
                id
            );
            return true;
        } catch (error) {
            console.log("OutFormService :: deleteOutForm :: error", error);
            return false;
        }
    }
    
    async getOutForm(id) {
        try {
            const document = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdoutform,
                id
            );
    
            // Parse `Items` if it exists
            return {
                ...document,
                Items: document.Items ? JSON.parse(document.Items) : [], // Parse Items if available
            };
        } catch (error) {
            console.log("OutFormService :: getOutForm :: error", error);
            return false;
        }
    }

    async getOutForms(queries = []) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdoutform,
                queries
            );
    
            // Parse `Items` for each PO if it exists
            response.documents = response.documents.map((doc) => ({
                ...doc,
                Items: doc.Items ? JSON.parse(doc.Items) : [], // Parse Items if available
            }));
    
            return response;
        } catch (error) {
            console.log("OutFormService :: getOutForms :: error", error);
            return false;
        }
    }

}

const InOutservice = new InOutService();
export default InOutservice;