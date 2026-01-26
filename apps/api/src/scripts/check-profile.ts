
import { profileService } from '../services/profile.service.js';
import { db } from '../db/index.js';

async function testLookup() {
    console.log('Testing username lookup for "admin"...');
    try {
        const result = await profileService.getEmailByUsername('admin');
        console.log('Lookup result:', result);
    } catch (error) {
        console.error('❌ Error checking username:', error);
    }
    process.exit(0);
}

testLookup();
