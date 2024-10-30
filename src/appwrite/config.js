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

    async createPost({ areas, subarea, feild, problem, status, userId, createdAt, id }) {
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
                    createdAt,
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

    async createProcure({ Item, Quantity, userId, postId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id,
                {
                    Item,
                    Quantity,
                    userId,
                    postId,
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
            console.log("searchItems response:", response);
            if (response.documents) {
                return response.documents;
            } else {
                console.warn("No items found.");
                return [];
            }
        } catch (error) {
            console.error("Error in searchItems:", error);
            return [];
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

    async createVendor({ Name, Address, GSTNo, userId, id }) {
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
            console.log("searchVendor response:", response);
            if (response.documents) {
                return response.documents;
            } else {
                console.warn("No vendors found.");
                return [];
            }
        } catch (error) {
            console.error("Error in searchVendor:", error);
            return [];
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

    async createLocation({ location, mainlocation, userId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdlocation,
                id,
                {
                    location,
                    mainlocation,
                    userId,
                }
            );
        } catch (error) {
            console.log("LocationService :: createLocation :: error", error);
        }
    }

    async updateLocation(id, { location, mainlocation }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdlocation,
                id,
                {
                    location,
                    mainlocation,
                }
            );
        } catch (error) {
            console.log("LocationService :: updateLocation :: error", error);
        }
    }

    async getLocationsByLocation(location) {
        return this.getLocations([Query.equal("location", location)]); // Fetch complaints by area
    }
    
    async deleteLocation(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdlocation,
                id
            );
            return true;
        } catch (error) {
            console.log("LocationService :: deleteLocation :: error", error);
            return false;
        }
    }

    async searchLocation(input) {
        try {
            const response = await this.getLocations([Query.search("location", input)]);
            console.log("searchVendor response:", response);
            if (response.documents) {
                return response.documents;
            } else {
                console.warn("No locations found.");
                return [];
            }
        } catch (error) {
            console.error("Error in searchLoacation:", error);
            return [];
        }
    }
    

    async getLocation(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdlocation,
                id
            );
        } catch (error) {
            console.log("LocationService :: LocationComplaint :: error", error);
            return false;
        }
    }

    async getLocations(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdlocation,
                queries
            );
        } catch (error) {
            console.log("LocationService :: LocationComplaints :: error", error);
            return false;
        }
    }

    async createPo({ vendorname, itemlist, amount, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpo,
                id,
                {
                    vendorname,
                    itemlist,
                    amount,
                }
            );
        } catch (error) {
            console.log("PoService :: createPo :: error", error);
        }
    }

    async updatePo(id, { vendorname, itemlist, amount }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpo,
                id,
                {
                    vendorname,
                    itemlist,
                    amount,
                }
            );
        } catch (error) {
            console.log("PoService :: updatePo :: error", error);
        }
    }

    async deletePo(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpo,
                id
            );
            return true;
        } catch (error) {
            console.log("PoService :: deletePo :: error", error);
            return false;
        }
    }

    async searchPo(input) {
        try {
            const response = await this.getPos([Query.search("Name", input)]);
            if (response.documents) {
                return response.documents; // Return the array of documents
            } else {
                console.warn("No documents found.");
                return []; // Return an empty array if no documents are found
            }
        } catch (error) {
            console.error("Error in searchPos:", error);
            return []; // Return an empty array on error
        }
    }
    

    async getPo(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpo,
                id
            );
        } catch (error) {
            console.log("PoService :: Po :: error", error);
            return false;
        }
    }

    async getPos(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpo,
                queries
            );
        } catch (error) {
            console.log("PoService :: Pos :: error", error);
            return false;
        }
    }
}

const service = new Service();
export default service;
