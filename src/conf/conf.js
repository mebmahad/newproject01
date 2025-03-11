const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionIdcomplaint: String(import.meta.env.VITE_APPWRITE_COLLECTION_COMPLAINT),
    appwriteCollectionIdprocurement: String(import.meta.env.VITE_APPWRITE_COLLECTION_PROCUREMENT),
    appwriteCollectionIdstore: String(import.meta.env.VITE_APPWRITE_COLLECTION_STORE),
    appwriteCollectionIdvendor: String(import.meta.env.VITE_APPWRITE_COLLECTION_VENDOR),
    appwriteCollectionIdpoform: String(import.meta.env.VITE_APPWRITE_COLLECTION_POFORM),
    appwriteCollectionIdlocation: String(import.meta.env.VITE_APPWRITE_COLLECTION_LOCATION),
    appwriteCollectionIdhead: String(import.meta.env.VITE_APPWRITE_COLLECTION_HEAD),
    appwriteCollectionIdbudget: String(import.meta.env.VITE_APPWRITE_COLLECTION_BUDGET),
    appwriteCollectionIdinform: String(import.meta.env.VITE_APPWRITE_COLLECTION_INFORM),
    appwriteCollectionIdoutform: String(import.meta.env.VITE_APPWRITE_COLLECTION_OUTFORM),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    appwriteCollectionIdqr: String(import.meta.env.VITE_APPWRITE_COLLECTION_QR),
}
// there was a name issue with the import.meta.env.VITE_APPWRITE_URL, it was later fixed in debugging video

export default conf