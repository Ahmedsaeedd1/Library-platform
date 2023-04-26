const mysql      = require('mysql');
const connection = mysql.createConnection({
host     : 'localhost',
user     : 'root',
password : '',
database : 'library platform',
port:'3306'
});

connection.connect((err)=> {
    if (err)
    {
        console.error('error connecting: ' );
        return;
    }
    console.log('database connected  ' );
});
module.exports = connection;