const Fetch = {
    get: async function(url)
    {
        let data;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Request failed');
            }
            data = await response.json();
            
        } catch (error) {
            console.error(error);
        }

        return data;
    },
    post: async function(url, FormData)
    {
        let data;
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(FormData),
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Request failed');
            }
            data = await response.json();

        } catch (error) {
            console.error('Catch Error: ', error);
        }
        return data;
    },
}