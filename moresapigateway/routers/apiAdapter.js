const axios = require('axios');

module.exports = (baseURL) => {
    
    try {
        return axios.create({
            baseURL: baseURL
        });
    } catch (error) {
        console.log(error);
    }
}