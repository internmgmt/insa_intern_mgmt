
const axios = require('axios');

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'coordinator@aau.edu.et',
            password: '?%w9Yj3BJMuB'
        });
        const token = loginRes.data.data.token;
        const user = loginRes.data.data.user;
        console.log('Logged in User:', JSON.stringify(user, null, 2));

        console.log('Listing Documents...');
        const docsRes = await axios.get('http://localhost:3000/api/documents?limit=100', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Docs Response Data:', JSON.stringify(docsRes.data, null, 2));

        const items = docsRes.data.data.items;
        console.log(`Found ${items.length} documents.`);
        items.forEach(doc => {
            console.log(`--- Doc ID: ${doc.id} ---`);
            console.log(`Title: ${doc.title}`);
            console.log(`UploadedBy (in meta):`, doc.metadata ? JSON.parse(doc.metadata).uploadedBy : 'N/A');
            console.log(`Student Relation:`, doc.student ? 'Present' : 'Missing');
            if (doc.student) {
                let univId = null;
                if (doc.student.application && doc.student.application.university) {
                    univId = doc.student.application.university.id;
                } else if (doc.student.application) {
                    univId = doc.student.application.universityId;
                }
                console.log('Student App Univ ID:', univId);
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

run();
