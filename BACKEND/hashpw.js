const bcrypt = require('bcrypt');

const plainPassword = 'Admin123'; // ඔයාට ඕන password එක
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log("ඔයාගේ Hashed Password එක මෙන්න:");
    console.log(hash); 
});
