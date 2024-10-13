import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";
import Item from '../pages/Item.jsx';

class Service {
    constructor() {
        this.client = new Client()
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async createPost({ areas, subarea, feild, problem, status, userId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdcomplaint,
                id,
                {
                    areas,
                    subarea,
                    feild,
                    problem,
                    status,
                    userId,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: createComplaint :: error", error);
        }
    }

    async updatePost(id, { areas, subarea, feild, problem, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdcomplaint,
                id,
                {
                    areas,
                    subarea,
                    feild,
                    problem,
                    status,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: updateComplaint :: error", error);
        }
    }

    async deletePost(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdcomplaint,
                id
            );
            return true;
        } catch (error) {
            console.log("ComplaintService :: deleteComplaint :: error", error);
            return false;
        }
    }

    async getPost(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdcomplaint,
                id
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaint :: error", error);
            return false;
        }
    }

    async getPosts(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdcomplaint,
                queries
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaints :: error", error);
            return false;
        }
    }

    async getIncompleteComplaints() {
        return this.getPosts([Query.equal("status", "inactive")]); // Fetch active complaints
    }

    async getCompleteComplaints() {
        return this.getPosts([Query.equal("status", "active")]); // Fetch inactive complaints
    }

    async getComplaintsByArea(areas) {
        return this.getPosts([Query.equal("areas", areas)]); // Fetch complaints by area
    }

    async getComplaintsByField(feild) {
        return this.getPosts([Query.equal("feild", feild)]); // Fetch complaints by field
    }

    async createProcure({ Item, Quantity, userId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id,
                {
                    Item,
                    Quantity,
                    userId,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: createComplaint :: error", error);
        }
    }

    async updateProcure(id, { Item, Quantity}) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id,
                {
                    Item,
                    Quantity,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: updateComplaint :: error", error);
        }
    }

    async deleteProcure(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id
            );
            return true;
        } catch (error) {
            console.log("ComplaintService :: deleteComplaint :: error", error);
            return false;
        }
    }

    async getProcure(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaint :: error", error);
            return false;
        }
    }

    async getProcures(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                queries
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaints :: error", error);
            return false;
        }
    }

    async createItem({ Item, Head, Price, Quantity, userId, Location, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdstore,
                id,
                {
                    Item,
                    Head,
                    Price,
                    Quantity,
                    Location,
                    userId,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: createComplaint :: error", error);
        }
    }

    async updateItem(id, { Item, Head, Price, Quantity, Location }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdstore,
                id,
                {
                    Item,
                    Head,
                    Price,
                    Quantity,
                    Location,
                }
            );
        } catch (error) {
            console.log("ComplaintService :: updateComplaint :: error", error);
        }
    }

    async deleteItem(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdstore,
                id
            );
            return true;
        } catch (error) {
            console.log("ComplaintService :: deleteComplaint :: error", error);
            return false;
        }
    }

    async searchItems(input) {
        try {
            const response = await this.getItems([Query.search("Item", input)]);
            if (response.documents) {
                return response.documents; // Return the array of documents
            } else {
                console.warn("No documents found.");
                return []; // Return an empty array if no documents are found
            }
        } catch (error) {
            console.error("Error in searchItems:", error);
            return []; // Return an empty array on error
        }
    }
    

    async getItem(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdstore,
                id
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaint :: error", error);
            return false;
        }
    }

    async getItems(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdstore,
                queries
            );
        } catch (error) {
            console.log("ComplaintService :: getComplaints :: error", error);
            return false;
        }
    }

    async createVendor({ Name, Address, GSTNo, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdvendor,
                id,
                {
                    Name,
                    Address,
                    GSTNo,
                    userId,
                }
            );
        } catch (error) {
            console.log("VenorService :: createVendor :: error", error);
        }
    }

    async updateVendor(id, { Name, Address, GSTNo }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdvendor,
                id,
                {
                    Name,
                    Address,
                    GSTNo,
                }
            );
        } catch (error) {
            console.log("VenorService :: updateVendor :: error", error);
        }
    }

    async deleteVendor(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdvendor,
                id
            );
            return true;
        } catch (error) {
            console.log("VenorService :: deleteVenor :: error", error);
            return false;
        }
    }

    async searchVendor(input) {
        try {
            const response = await this.getVendors([Query.search("Name", input)]);
            if (response.documents) {
                return response.documents; // Return the array of documents
            } else {
                console.warn("No documents found.");
                return []; // Return an empty array if no documents are found
            }
        } catch (error) {
            console.error("Error in searchVendors:", error);
            return []; // Return an empty array on error
        }
    }
    

    async getVendor(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdvendor,
                id
            );
        } catch (error) {
            console.log("VendorService :: VendorComplaint :: error", error);
            return false;
        }
    }

    async getVendors(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdvendor,
                queries
            );
        } catch (error) {
            console.log("VendorService :: VendorComplaints :: error", error);
            return false;
        }
    }
}

const service = new Service();
export default service;
