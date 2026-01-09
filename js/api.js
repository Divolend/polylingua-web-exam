// API Module for handling all API requests

class API {
    // GET request
    static async get(endpoint) {
        try {
            const url = buildUrl(endpoint);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    // POST request
    static async post(endpoint, data) {
        try {
            const url = buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    // PUT request
    static async put(endpoint, data) {
        try {
            const url = buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }

    // DELETE request
    static async delete(endpoint) {
        try {
            const url = buildUrl(endpoint);
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    // Specific API methods
    static getCourses() {
        return this.get(ENDPOINTS.courses);
    }

    static getTutors() {
        return this.get(ENDPOINTS.tutors);
    }

    static getOrders() {
        return this.get(ENDPOINTS.orders);
    }

    static getOrderById(id) {
        return this.get(ENDPOINTS.orderById(id));
    }

    static getCourseById(id) {
        return this.get(ENDPOINTS.courseById(id));
    }

    static getTutorById(id) {
        return this.get(ENDPOINTS.tutorById(id));
    }

    static createOrder(orderData) {
        return this.post(ENDPOINTS.orders, orderData);
    }

    static updateOrder(id, orderData) {
        return this.put(ENDPOINTS.orderById(id), orderData);
    }

    static deleteOrder(id) {
        return this.delete(ENDPOINTS.orderById(id));
    }
}