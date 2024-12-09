const mysql = require('mysql');
require('dotenv').config()
module.exports.dbConnect = async function dbConnect(){
    try{
        const db = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });
        
        db.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });

        return db;
    } catch (error) {
        console.error('Error Connecting to Database:', error);
    }
}

const listarang = [
    '1279773949332291615', // Director
    '1279773950230138923', // Assistant
    '1279773951077384282', // Deputy
    '1279773952331485297', // Senior Registrar
    '1292071966035017809', // Sectional Head
    '1292071842961690636', // Associate Professor
    '1279773956705882183', // Senior Doctor
    '1279773957884477503', // Doctor
    '1292071720517369950', // Medical Specjalist
    '1279773958794907679', // Senior Physican
    '1279773959742820374', // Physican
    '1279773960891793489', // Resident
    '1279773961542176870', // Advanced EMT
    '1279773963802902598', // EMT
    '1279773964863799381', // EMT Apprentice
    '1279773966633930754', // Trainee
];
const listarang2 = [
    '1279773953207963794', // Management
    '1292071842961690636', // Associate Professor
    '1279773956705882183', // Senior Doctor
    '1279773957884477503', // Doctor
    '1292071720517369950', // Medical Specjalist
    '1279773958794907679', // Senior Physican
    '1279773959742820374', // Physican
    '1279773960891793489', // Resident
    '1279773961542176870', // Advanced EMT
    '1279773963802902598', // EMT
    '1279773964863799381', // EMT Apprentice
    '1279773966633930754', // Trainee
];
module.exports.listarang = listarang;
module.exports.listarang2 = listarang2;
module.exports.getHighestRole = function getHighestRole(member) {
    let highestRole;
    const userRoles = member.roles.cache;
    for (const role of userRoles.values()) {
        if (listarang.includes(role.id)) {
            highestRole = role;
            break;
        }
    }
    return highestRole;
}