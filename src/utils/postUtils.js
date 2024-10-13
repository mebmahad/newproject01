import { Query } from "appwrite"; // Import your Query if needed

export const getQueriesFromFilter = (filter) => {
    const queries = [];
    if (filter.areas) {
        queries.push(Query.equal('areas', filter.areas));
    }
    if (filter.feild) {
        queries.push(Query.equal('feild', filter.feild));
    }
    return queries;
};

export const categorizePosts = (allPosts) => {
    const completed = allPosts.filter(post => post.status === 'inactive');
    const incomplete = allPosts.filter(post => post.status === 'active');
    return { completed, incomplete };
};
