const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function run() {
    try {
        // Authenticate to get a token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user@example.com', // wait, I don't know the exact user. We will just register a temp user.
            password: 'password123'
        }).catch(async (e) => {
            return await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Test Upload Bot',
                email: 'uploadbot@example.com',
                password: 'password123'
            });
        });
        const token = loginRes.data.token;

        // Create a dummy image
        const imgPath = path.join(__dirname, 'test_dummy.jpg');
        fs.writeFileSync(imgPath, 'fake image content');

        // Prepare FormData
        const form = new FormData();
        form.append('title', 'API Upload Test');
        form.append('description', 'Testing multipart boundary logic');
        form.append('category', 'Technical');
        form.append('priority', 'Medium');
        form.append('image', fs.createReadStream(imgPath));

        // Submit request
        const res = await axios.post('http://localhost:5000/api/requests', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('UPLOAD SUCCESS:', res.data.data.image);
    } catch (e) {
        console.error('UPLOAD ERROR:', e.response ? e.response.data : e.message);
    }
}
run();
