import axios from 'axios';

const httpRequest = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL,
});

export const get = async (path, params = {}) => {
    const response = await httpRequest.get(path, params);

    return response.data;
};

export const post = async (path, data = {}, params = {}) => {
    const response = await httpRequest.post(path, data, params);

    return response.data;
}

export default httpRequest;
