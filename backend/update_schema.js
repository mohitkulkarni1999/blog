const pool = require('./config/db');

async function checkColumns() {
    try {
        const [rows] = await pool.query('SHOW COLUMNS FROM posts');
        console.log('Columns in posts table:');
        rows.forEach(row => console.log(`- ${row.Field} (${row.Type})`));
        
        // Add columns if they don't exist
        const columnsToAdd = [
            { name: 'topic_cluster', type: 'VARCHAR(255)' },
            { name: 'focus_keywords', type: 'JSON' },
            { name: 'featured_image_prompt', type: 'TEXT' },
            { name: 'social_caption', type: 'TEXT' },
            { name: 'external_sources', type: 'JSON' }
        ];
        
        for (const col of columnsToAdd) {
            const exists = rows.find(r => r.Field === col.name);
            if (!exists) {
                console.log(`Adding column: ${col.name}`);
                await pool.query(`ALTER TABLE posts ADD COLUMN ${col.name} ${col.type}`);
            }
        }
        console.log('Schema check/update complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkColumns();
