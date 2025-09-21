// Debug script to test admin authentication
const fetch = require('node-fetch');

async function testAdminAuth() {
    try {
        console.log('🔐 Testing admin authentication...');
        
        // First, login as admin
        const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@institution.edu',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('📝 Login response:', loginData);
        
        if (loginResponse.ok && loginData.token) {
            console.log('✅ Login successful, token received');
            
            // Now test the overview endpoint
            const overviewResponse = await fetch('http://localhost:3000/api/admin/dashboard/overview', {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });
            
            if (overviewResponse.ok) {
                const overviewData = await overviewResponse.json();
                console.log('✅ Overview data fetched successfully:', overviewData);
            } else {
                console.log('❌ Overview fetch failed:', overviewResponse.status, overviewResponse.statusText);
                const errorText = await overviewResponse.text();
                console.log('Error details:', errorText);
            }
        } else {
            console.log('❌ Login failed:', loginResponse.status, loginResponse.statusText);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testAdminAuth();
