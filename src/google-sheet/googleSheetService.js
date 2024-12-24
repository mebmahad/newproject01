class GoogleSheetService {
    constructor() {
      this.scriptURL = 'https://script.google.com/macros/s/AKfycbwVK5wUsBwgc-vo98P8vEHqmGnmM7PBnbDsA1bs-ytmI4pU_QiF00xBtrARI1qwLgfg/exec'; // Replace with your Google Apps Script URL
      this.scriptURL1 = 'https://script.google.com/macros/s/AKfycbxMNAbchP6qUYrvE_SJYslk6DpTmjfK9pkcdx0w6yIAfa-brAOVKOF1zkecd1JvPPn8/exec'
    }
  
    /**
     * Sends data to the Google Sheet
     * @param {Object} formData - The data to be sent (e.g., {name, email, message}).
     * @returns {Promise<Response>} - The fetch response.
     */
    async createPost({ areas, subarea, feild, problem, status, userId, createdAt, id }) {
      try {
        const response = await fetch(this.scriptURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ areas, subarea, feild, problem, status, userId, createdAt, id }),
          mode: 'no-cors',
        });

      } catch (error) {
        console.error('GoogleSheetService Error:', error);
        throw error;
      }
    }

    async updatePost(id,{ areas, subarea, feild, problem, status, userId, createdAt}) {
      try {
        const response = await fetch(this.scriptURL1, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, id }),
          mode: 'no-cors',
        });

  
        return response;
        console.log(response);

      } catch (error) {
        console.error('GoogleSheetService Error:', error);
        throw error;
      }
    }
  }
  const gsheetservice = new GoogleSheetService();
  export default gsheetservice;
  