import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

class Service {
    constructor() {
        this.client = new Client()
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
    }

    async createBudget({ yearlyBudget, monthlyBudget, fiscalYear, startDate, endDate, 
        isActive, updatedAt, userId, createdAt,  id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdbudget,
                id,
                {
                    yearlyBudget,
                    monthlyBudget,
                    fiscalYear,
                    startDate,
                    endDate,
                    userId,
                    createdAt,
                    isActive,
                    updatedAt,
                }
            );
        } catch (error) {
            console.log("BudgetService :: createBudget :: error", error);
        }
    }

    async updateBudget(id, { yearlyBudget, monthlyBudget, fiscalYear, startDate, endDate, 
        isActive, updatedAt, userId, createdAt }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdbudget,
                id,
                {
                    yearlyBudget,
                    monthlyBudget,
                    fiscalYear,
                    startDate,
                    endDate,
                    userId,
                    createdAt,
                    isActive,
                    updatedAt,
                }
            );
        } catch (error) {
            console.log("BudgetService :: updateBudget :: error", error);
        }
    }

    async deleteBudget(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdbudget,
                id
            );
            return true;
        } catch (error) {
            console.log("BudgetService :: deleteBudget :: error", error);
            return false;
        }
    }

    async getBudget(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdbudget,
                id
            );
        } catch (error) {
            console.log("BudgetService :: getBudget :: error", error);
            return false;
        }
    }

    async getBudgets(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdbudget,
                queries
            );
        } catch (error) {
            console.log("BudgetService :: getBudgets :: error", error);
            return false;
        }
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
            let allDocuments = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;
    
            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionIdcomplaint,
                    [...queries, Query.limit(limit), Query.offset(offset)]
                );
                allDocuments = [...allDocuments, ...response.documents];
                hasMore = response.documents.length === limit; // Check if there's more data
                offset += limit;
            }
    
            return { documents: allDocuments };
        } catch (error) {
            console.log("ComplaintService :: Complaints :: error", error);
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

    async createProcure({ Items, userId, postId, status, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id,
                {
                    Items,
                    userId,
                    postId,
                    status,
                }
            );
        } catch (error) {
            console.log("ProcureService :: createProcure :: error", error);
        }
    }

    async updateProcure(id, { Items, userId, postId, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id,
                {
                    Items,
                    userId,
                    postId,
                    status,
                }
            );
        } catch (error) {
            console.log("ProcureService :: updateProcure :: error", error);
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
            console.log("ProcureService :: deleteProcure :: error", error);
            return false;
        }
    }

    async getProcure(id) {
        try {
            // Fetch the procurement document
            const procure = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                id
            );
    
            // Parse the `items` field if it exists and is in string format
            if (procure && procure.Items) {
                try {
                    procure.items = JSON.parse(procure.Items); // Parse the string into an array of item objects
                } catch (error) {
                    console.log("ProcureService :: getProcure :: JSON parse error for items:", error);
                    procure.items = []; // Set to an empty array if parsing fails
                }
            }
    
            // Check if procure has a postId, then fetch the post data
            if (procure && procure.postId) {
                const post = await this.getPost(procure.postId); // Pass the actual postId value
                // Attach the post data to the procure object
                procure.post = post;
            }
    
            return procure;
        } catch (error) {
            console.log("ProcureService :: getProcure :: error", error);
            return false;
        }
    }
    
    async getActiveProcures() {
        return this.getProcures([Query.equal("status", "active")]); // Fetch active complaints
    }

    async getInactiveProcures() {
        return this.getProcures([Query.equal("status", "inactive")]); // Fetch inactive complaints
    }

    async getProcures(queries = []) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdprocurement,
                queries
            );
        } catch (error) {
            console.log("ProcureService :: getProcures :: error", error);
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


    async updateItemQuantity(itemName, qtyChange) {
        try {
            console.log(`Updating item: ${itemName} with qtyChange: ${qtyChange}`);
            
            const allItems = [];
            let offset = 0;
            const limit = 100; // Adjust limit based on your requirements
            
            // Fetch all items using pagination
            let hasMore = true;
            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionIdstore,
                    [Query.limit(limit), Query.offset(offset)]
                );
    
                allItems.push(...response.documents);
                hasMore = response.documents.length === limit; // Check if there are more items to fetch
                offset += limit;
            }
    
            console.log("Available items:", allItems.map(doc => doc.Item));
    
            // Find the item to update
            const item = allItems.find((doc) => doc.Item === itemName);
    
            if (!item) {
                console.error(`Item not found: ${itemName}`);
                throw new Error('Item not found');
            }
    
            const currentQuantity = parseInt(item.Quantity, 10);
            if (isNaN(currentQuantity)) {
                console.error(`Invalid quantity for item: ${itemName}`);
                throw new Error('Invalid quantity');
            }
    
            const newQuantity = currentQuantity + qtyChange;
            if (newQuantity < 0) {
                console.error(`Insufficient quantity for item: ${itemName}`);
                throw new Error('Insufficient quantity');
            }
    
            await this.updateItem(item.$id, {
                Item: item.Item,
                Head: item.Head,
                Price: item.Price,
                Quantity: newQuantity.toString(),
                Location: item.Location,
            });
    
            console.log(`Updated ${itemName} to new quantity: ${newQuantity}`);
            return newQuantity;
        } catch (error) {
            console.error('Error updating item quantity:', error);
            throw error;
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
            const allDocuments = [];
            let offset = 0;
            const limit = 100;
            let hasMore = true;
    
            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionIdstore,
                    [
                        Query.search("Item", input), // Adjust based on your indexing setup
                        Query.limit(limit),
                        Query.offset(offset),
                    ]
                );
    
                allDocuments.push(...response.documents);
                hasMore = response.documents.length === limit;
                offset += limit;
            }
    
            console.log("Total items fetched:", allDocuments.length);
            return allDocuments;
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
            let allDocuments = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;
    
            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionIdstore,
                    [...queries, Query.limit(limit), Query.offset(offset)]
                );
                allDocuments = [...allDocuments, ...response.documents];
                hasMore = response.documents.length === limit; // Check if there's more data
                offset += limit;
            }
    
            return { documents: allDocuments };
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
            let allDocuments = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;
    
            while (hasMore) {
                const response = await this.databases.listDocuments(
                    conf.appwriteDatabaseId,
                    conf.appwriteCollectionIdlocation,
                    [...queries, Query.limit(limit), Query.offset(offset)]
                );
                allDocuments = [...allDocuments, ...response.documents];
                hasMore = response.documents.length === limit; // Check if there's more data
                offset += limit;
            }
    
            return { documents: allDocuments };
        } catch (error) {
            console.log("LocationService :: locationComplaints :: error", error);
            return false;
        }
    }

    async createHead({ Headname, Budgteamount, userId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdhead,
                id,
                {
                    Headname,
                    Budgteamount,
                    userId,
                }
            );
        } catch (error) {
            console.log("HeadService :: createHead :: error", error);
        }
    }

    async updateHead(id, { Headname, Budgteamount }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdhead,
                id,
                {
                    Headname,
                    Budgteamount,
                }
            );
        } catch (error) {
            console.log("HeadService :: updateHead :: error", error);
        }
    }

    async deleteHead(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdhead,
                id
            );
            return true;
        } catch (error) {
            console.log("HeadService :: deleteHead :: error", error);
            return false;
        }
    }

    async searchHead(input) {
        try {
            const response = await this.getHeads([Query.search("Headname", input)]);
            console.log("searchVendor response:", response);
            if (response.documents) {
                return response.documents;
            } else {
                console.warn("No Heads found.");
                return [];
            }
        } catch (error) {
            console.error("Error in searchHead:", error);
            return [];
        }
    }
    

    async getHead(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdhead,
                id
            );
        } catch (error) {
            console.log("HeadService :: HeadComplaint :: error", error);
            return false;
        }
    }

    async getHeads(queries = []) {
        try {
            // Add a limit query if not already provided
            if (!queries.some(query => query.type === 'limit')) {
                queries.push(Query.limit(150)); // Use the Appwrite Query object
            }
            
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdhead,
                queries
            );
        } catch (error) {
            console.log("HeadService :: HeadComplaints :: error", error);
            return false;
        }
    }
    async createQr({ name, location, modelNo, purchaseDate, serviceDate, userId, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdqr,
                id,
                {
                    name,
                    location,
                    modelNo,
                    purchaseDate,
                    serviceDate,
                    userId,
                }
            );
        } catch (error) {
            console.log("QrService :: createQr :: error", error);
        }
    }

    async updateQr(id, { name, location, modelNo, purchaseDate, serviceDate }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdqr,
                id,
                {
                    name,
                    location,
                    modelNo,
                    purchaseDate,
                    serviceDate,
                }
            );
        } catch (error) {
            console.log("QrService :: updateQr :: error", error);
        }
    }

    async deleteQr(id) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdqr,
                id
            );
            return true;
        } catch (error) {
            console.log("QrService :: deleteQr :: error", error);
            return false;
        }
    }

    async getQr(id) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdqr,
                id
            );
        } catch (error) {
            console.log("QrService :: Qr :: error", error);
            return false;
        }
    }

    async getQrs(queries = []) {
        try {
            // Add a limit query if not already provided
            if (!queries.some(query => query.type === 'limit')) {
                queries.push(Query.limit(150)); // Use the Appwrite Query object
            }
            
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdQr,
                queries
            );
        } catch (error) {
            console.log("QrService :: Qrs :: error", error);
            return false;
        }
    }
    

    async createPo({ VendorName, Items, totalAmount, gst, totalamountwithgst, postId, procureId, pono, id }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpoform,
                id,
                {
                    VendorName,
                    Items,
                    totalAmount,
                    gst,
                    totalamountwithgst,
                    procureId,
                    postId,
                    pono,
                }
            );
        } catch (error) {
            console.log("PoService :: createPo :: error", error);
        }
    }

    async updatePo(id, { VendorName, Items, totalAmount, gst, totalamountwithgst, pono, postId, procureId }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpoform,
                id,
                {
                    VendorName,
                    Items,
                    totalAmount,
                    gst,
                    totalamountwithgst,
                    procureId,
                    postId,
                    pono,
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
                conf.appwriteCollectionIdpoform,
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
            const document = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpoform,
                id
            );
    
            // Parse `Items` if it exists
            return {
                ...document,
                Items: document.Items ? JSON.parse(document.Items) : [], // Parse Items if available
            };
        } catch (error) {
            console.log("PoService :: getPo :: error", error);
            return false;
        }
    }

    async getPos({ page = 1, limit = 10 } = {}) {
        try {
            // Calculate offset based on the page and limit
            const offset = (page - 1) * limit;
    
            // Use Appwrite's Query methods for limit and offset
            const queries = [
                Query.limit(limit),
                Query.offset(offset),
            ];
    
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionIdpoform,
                queries
            );
    
            // Parse `Items` for each PO if it exists
            response.documents = response.documents.map((doc) => ({
                ...doc,
                Items: doc.Items ? JSON.parse(doc.Items) : [], // Parse Items if available
            }));
    
            return response;
        } catch (error) {
            console.log("PoService :: getPos :: error", error);
            return false;
        }
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

const service = new Service();
export default service;
