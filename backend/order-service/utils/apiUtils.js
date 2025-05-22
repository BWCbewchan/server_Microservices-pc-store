const axios = require('axios');

/**
 * Makes an HTTP request with automatic retries
 * @param {Object} config - Axios request configuration
 * @param {Number} retries - Maximum number of retry attempts
 * @param {Number} delay - Initial delay between retries in ms
 * @param {Number} maxDelay - Maximum delay between retries in ms
 * @returns {Promise<Object>} - Response from the server
 */
const axiosWithRetry = async (config, retries = 3, delay = 1000, maxDelay = 10000) => {
    let lastError;
    let currentDelay = delay;
    
    // Add timeout if not specified
    if (!config.timeout) {
        config.timeout = 10000; // 10 seconds default timeout
    }
    
    // Log the request details
    console.log(`API Request: ${config.method || 'GET'} ${config.url}`);
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`Retry attempt ${attempt}/${retries} for ${config.url}`);
            }
            
            const response = await axios(config);
            
            // Log success
            console.log(`API Request succeeded: ${config.method || 'GET'} ${config.url} (${response.status})`);
            
            return response;
        } catch (error) {
            lastError = error;
            
            // Detailed error logging
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error(`API Error (${attempt}/${retries}): ${error.response.status} for ${config.url}`, 
                    error.response.data);
                
                // Don't retry 4xx client errors (except 429 Too Many Requests)
                if (error.response.status >= 400 && 
                    error.response.status < 500 && 
                    error.response.status !== 429) {
                    throw error;
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error(`API No Response (${attempt}/${retries}) for ${config.url}:`, 
                    error.message);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error(`API Request Setup Error (${attempt}/${retries}) for ${config.url}:`, 
                    error.message);
            }
            
            // If we've reached max retries, rethrow the error
            if (attempt >= retries) {
                console.error(`Maximum retries (${retries}) reached for ${config.url}`);
                throw error;
            }
            
            // Wait before retrying with exponential backoff and jitter
            console.log(`Waiting ${currentDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            
            // Add some randomness to the delay (jitter) to prevent all clients retrying simultaneously
            const jitter = Math.random() * 0.3 * currentDelay; // 0-30% jitter
            currentDelay = Math.min(maxDelay, currentDelay * 1.5 + jitter);
        }
    }
};

/**
 * Simplified GET request with retry
 */
const get = (url, config = {}) => {
    return axiosWithRetry({
        method: 'GET',
        url,
        ...config
    });
};

/**
 * Simplified POST request with retry
 */
const post = (url, data, config = {}) => {
    return axiosWithRetry({
        method: 'POST',
        url,
        data,
        ...config
    });
};

/**
 * Simplified PUT request with retry
 */
const put = (url, data, config = {}) => {
    return axiosWithRetry({
        method: 'PUT',
        url,
        data,
        ...config
    });
};

/**
 * Simplified DELETE request with retry
 */
const del = (url, config = {}) => {
    return axiosWithRetry({
        method: 'DELETE',
        url,
        ...config
    });
};

module.exports = {
    axiosWithRetry,
    get,
    post,
    put,
    delete: del
};
