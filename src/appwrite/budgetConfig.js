import conf from '../conf/conf.js';
import { Client, ID, Databases, Query } from "appwrite";

class BuggetService {
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

}

const budgetservice = new BuggetService();
export default budgetservice;